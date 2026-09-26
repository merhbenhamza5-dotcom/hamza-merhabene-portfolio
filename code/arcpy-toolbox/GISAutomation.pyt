# -*- coding: utf-8 -*-
"""
GIS Automation Toolbox — Hamza Merhabene
=========================================
Python toolbox (.pyt) for ArcGIS Pro 3.x that automates repetitive
geoprocessing and file-management tasks:

  1. Batch Project        — reproject every feature class of a workspace
  2. Batch Clip & Export  — clip many layers to one area of interest
  3. QC Checks            — geometry, duplicate and empty-field report (CSV)
  4. GIS to CAD           — export layers to DWG / DXF
  5. Package Deliverables — copy map exports into a dated folder and zip it

Usage: in ArcGIS Pro, Catalog pane > Toolboxes > Add Toolbox > GISAutomation.pyt
"""

import csv
import datetime
import fnmatch
import os
import shutil

import arcpy


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def _list_feature_classes(workspace):
    """Return full paths of all feature classes in a workspace,
    including those inside feature datasets."""
    previous = arcpy.env.workspace
    arcpy.env.workspace = workspace
    paths = [os.path.join(workspace, fc) for fc in (arcpy.ListFeatureClasses() or [])]
    for ds in arcpy.ListDatasets(feature_type="feature") or []:
        for fc in arcpy.ListFeatureClasses(feature_dataset=ds) or []:
            paths.append(os.path.join(workspace, ds, fc))
    arcpy.env.workspace = previous
    return paths


def _output_path(out_workspace, in_path, suffix=""):
    """Build a valid output path for a geodatabase or a folder of shapefiles."""
    base = os.path.splitext(os.path.basename(in_path))[0] + suffix
    name = arcpy.ValidateTableName(base, out_workspace)
    if arcpy.Describe(out_workspace).workspaceType == "FileSystem":
        name += ".shp"
    return os.path.join(out_workspace, name)


def _feature_class_param(name="in_features", label="Input Features"):
    p = arcpy.Parameter(displayName=label, name=name, datatype="GPFeatureLayer",
                        parameterType="Required", direction="Input", multiValue=True)
    return p


# --------------------------------------------------------------------------- #
# Toolbox
# --------------------------------------------------------------------------- #
class Toolbox(object):
    def __init__(self):
        self.label = "GIS Automation"
        self.alias = "gisautomation"
        self.tools = [BatchProject, BatchClipExport, QCChecks, GISToCAD, PackageDeliverables]


# --------------------------------------------------------------------------- #
# 1. Batch Project
# --------------------------------------------------------------------------- #
class BatchProject(object):
    def __init__(self):
        self.label = "Batch Project"
        self.description = ("Reprojects every feature class of a workspace (including feature "
                             "datasets) to a target coordinate system, with an optional "
                             "geographic (datum) transformation.")
        self.canRunInBackground = False

    def getParameterInfo(self):
        in_ws = arcpy.Parameter(displayName="Input Workspace", name="in_workspace",
                                datatype="DEWorkspace", parameterType="Required", direction="Input")
        out_ws = arcpy.Parameter(displayName="Output Workspace", name="out_workspace",
                                 datatype="DEWorkspace", parameterType="Required", direction="Input")
        out_crs = arcpy.Parameter(displayName="Output Coordinate System", name="out_crs",
                                  datatype="GPCoordinateSystem", parameterType="Required", direction="Input")
        transform = arcpy.Parameter(displayName="Geographic Transformation (optional)",
                                    name="transformation", datatype="GPString",
                                    parameterType="Optional", direction="Input")
        return [in_ws, out_ws, out_crs, transform]

    def execute(self, parameters, messages):
        in_ws = parameters[0].valueAsText
        out_ws = parameters[1].valueAsText
        out_crs = parameters[2].value
        transform = parameters[3].valueAsText or ""

        feature_classes = _list_feature_classes(in_ws)
        arcpy.SetProgressor("step", "Projecting feature classes...", 0, max(len(feature_classes), 1), 1)
        done, skipped = 0, 0
        for fc in feature_classes:
            arcpy.SetProgressorLabel("Projecting {}".format(os.path.basename(fc)))
            try:
                if arcpy.Describe(fc).spatialReference.name == "Unknown":
                    arcpy.AddWarning("Skipped (undefined CRS): {}".format(fc))
                    skipped += 1
                else:
                    out_fc = _output_path(out_ws, fc)
                    arcpy.management.Project(fc, out_fc, out_crs, transform)
                    arcpy.AddMessage("Projected: {} -> {}".format(os.path.basename(fc), out_fc))
                    done += 1
            except arcpy.ExecuteError:
                arcpy.AddWarning("Failed: {}\n{}".format(fc, arcpy.GetMessages(2)))
                skipped += 1
            arcpy.SetProgressorPosition()
        arcpy.ResetProgressor()
        arcpy.AddMessage("Done: {} projected, {} skipped.".format(done, skipped))


# --------------------------------------------------------------------------- #
# 2. Batch Clip & Export
# --------------------------------------------------------------------------- #
class BatchClipExport(object):
    def __init__(self):
        self.label = "Batch Clip & Export"
        self.description = "Clips several layers to one area of interest and writes them to an output workspace."
        self.canRunInBackground = False

    def getParameterInfo(self):
        in_features = _feature_class_param()
        clip = arcpy.Parameter(displayName="Clip Features (area of interest)", name="clip_features",
                               datatype="GPFeatureLayer", parameterType="Required", direction="Input")
        clip.filter.list = ["Polygon"]
        out_ws = arcpy.Parameter(displayName="Output Workspace", name="out_workspace",
                                 datatype="DEWorkspace", parameterType="Required", direction="Input")
        suffix = arcpy.Parameter(displayName="Output Name Suffix", name="suffix",
                                 datatype="GPString", parameterType="Optional", direction="Input")
        suffix.value = "_clip"
        return [in_features, clip, out_ws, suffix]

    def execute(self, parameters, messages):
        layers = parameters[0].valueAsText.split(";")
        clip = parameters[1].valueAsText
        out_ws = parameters[2].valueAsText
        suffix = parameters[3].valueAsText or ""

        for layer in layers:
            layer = layer.strip("'")
            try:
                out_fc = _output_path(out_ws, arcpy.Describe(layer).catalogPath, suffix)
                arcpy.analysis.Clip(layer, clip, out_fc)
                count = int(arcpy.management.GetCount(out_fc)[0])
                arcpy.AddMessage("{} -> {} ({} features)".format(layer, out_fc, count))
                if count == 0:
                    arcpy.AddWarning("No features of {} inside the area of interest.".format(layer))
            except arcpy.ExecuteError:
                arcpy.AddWarning("Failed: {}\n{}".format(layer, arcpy.GetMessages(2)))


# --------------------------------------------------------------------------- #
# 3. QC Checks
# --------------------------------------------------------------------------- #
class QCChecks(object):
    def __init__(self):
        self.label = "QC Checks"
        self.description = ("Runs data-quality checks and writes a CSV report: geometry problems "
                            "(Check Geometry), duplicate geometries, empty values in required "
                            "fields and undefined coordinate systems.")
        self.canRunInBackground = False

    def getParameterInfo(self):
        in_features = _feature_class_param()
        fields = arcpy.Parameter(displayName="Required Fields (comma-separated, optional)",
                                 name="required_fields", datatype="GPString",
                                 parameterType="Optional", direction="Input")
        report = arcpy.Parameter(displayName="Output CSV Report", name="out_report",
                                 datatype="DEFile", parameterType="Required", direction="Output")
        report.filter.list = ["csv"]
        return [in_features, fields, report]

    def execute(self, parameters, messages):
        layers = [l.strip("'") for l in parameters[0].valueAsText.split(";")]
        required = [f.strip() for f in (parameters[1].valueAsText or "").split(",") if f.strip()]
        report_path = parameters[2].valueAsText
        rows = []

        for layer in layers:
            desc = arcpy.Describe(layer)
            name = desc.name
            total = int(arcpy.management.GetCount(layer)[0])
            rows.append([name, "feature_count", total, ""])

            # Coordinate system
            if desc.spatialReference.name == "Unknown":
                rows.append([name, "undefined_crs", 1, "Define the projection before delivery"])

            # Geometry problems
            geom_table = arcpy.CreateUniqueName("qc_geom", arcpy.env.scratchGDB)
            arcpy.management.CheckGeometry(layer, geom_table)
            with arcpy.da.SearchCursor(geom_table, ["FEATURE_ID", "PROBLEM"]) as cursor:
                problems = list(cursor)
            rows.append([name, "geometry_problems", len(problems),
                         "; ".join("OID {}: {}".format(fid, p) for fid, p in problems[:20])])
            arcpy.management.Delete(geom_table)

            # Duplicate geometries
            dup_table = arcpy.CreateUniqueName("qc_dup", arcpy.env.scratchGDB)
            arcpy.management.FindIdentical(layer, dup_table, ["Shape"],
                                           output_record_option="ONLY_DUPLICATES")
            dup_count = int(arcpy.management.GetCount(dup_table)[0])
            rows.append([name, "duplicate_geometries", dup_count, ""])
            arcpy.management.Delete(dup_table)

            # Empty values in required fields
            existing = {f.name.lower(): f.name for f in arcpy.ListFields(layer)}
            for field in required:
                if field.lower() not in existing:
                    rows.append([name, "missing_field", 1, field])
                    continue
                real = existing[field.lower()]
                empty = 0
                with arcpy.da.SearchCursor(layer, [real]) as cursor:
                    for (value,) in cursor:
                        if value is None or (isinstance(value, str) and not value.strip()):
                            empty += 1
                rows.append([name, "empty_values:" + real, empty, ""])

            arcpy.AddMessage("Checked {} ({} features)".format(name, total))

        with open(report_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["layer", "check", "count", "details"])
            writer.writerows(rows)
        issues = sum(1 for r in rows if r[1] != "feature_count" and r[2])
        arcpy.AddMessage("QC report written to {} — {} check(s) flagged.".format(report_path, issues))


# --------------------------------------------------------------------------- #
# 4. GIS to CAD
# --------------------------------------------------------------------------- #
class GISToCAD(object):
    def __init__(self):
        self.label = "GIS to CAD"
        self.description = "Exports one or more layers to a DWG or DXF file for AutoCAD."
        self.canRunInBackground = False

    def getParameterInfo(self):
        in_features = _feature_class_param()
        cad_type = arcpy.Parameter(displayName="CAD Format", name="cad_type",
                                   datatype="GPString", parameterType="Required", direction="Input")
        cad_type.filter.type = "ValueList"
        cad_type.filter.list = ["DWG_R2018", "DWG_R2013", "DWG_R2010", "DXF_R2018", "DXF_R2013"]
        cad_type.value = "DWG_R2018"
        out_file = arcpy.Parameter(displayName="Output CAD File", name="out_file",
                                   datatype="DEFile", parameterType="Required", direction="Output")
        out_file.filter.list = ["dwg", "dxf"]
        return [in_features, cad_type, out_file]

    def execute(self, parameters, messages):
        layers = [l.strip("'") for l in parameters[0].valueAsText.split(";")]
        cad_type = parameters[1].valueAsText
        out_file = parameters[2].valueAsText
        for layer in layers:
            if arcpy.Describe(layer).spatialReference.name == "Unknown":
                arcpy.AddWarning("{} has no coordinate system — CAD coordinates may be wrong.".format(layer))
        arcpy.conversion.ExportCAD(layers, cad_type, out_file, "IGNORE_FILENAMES_IN_TABLES",
                                   "OVERWRITE_EXISTING_FILES")
        arcpy.AddMessage("CAD file written: {}".format(out_file))


# --------------------------------------------------------------------------- #
# 5. Package Deliverables
# --------------------------------------------------------------------------- #
class PackageDeliverables(object):
    def __init__(self):
        self.label = "Package Deliverables"
        self.description = ("Copies deliverable files (maps, reports, CAD) that match a pattern into "
                            "a dated project folder and creates a ZIP archive of it.")
        self.canRunInBackground = False

    def getParameterInfo(self):
        src = arcpy.Parameter(displayName="Source Folder", name="source_folder",
                              datatype="DEFolder", parameterType="Required", direction="Input")
        patterns = arcpy.Parameter(displayName="File Patterns", name="patterns",
                                   datatype="GPString", parameterType="Required", direction="Input")
        patterns.value = "*.pdf;*.png;*.dwg;*.dxf;*.xlsx"
        project = arcpy.Parameter(displayName="Project Code", name="project_code",
                                  datatype="GPString", parameterType="Required", direction="Input")
        out = arcpy.Parameter(displayName="Output Folder", name="out_folder",
                              datatype="DEFolder", parameterType="Required", direction="Input")
        make_zip = arcpy.Parameter(displayName="Create ZIP archive", name="make_zip",
                                   datatype="GPBoolean", parameterType="Optional", direction="Input")
        make_zip.value = True
        return [src, patterns, project, out, make_zip]

    def execute(self, parameters, messages):
        src = parameters[0].valueAsText
        patterns = [p.strip() for p in parameters[1].valueAsText.split(";") if p.strip()]
        project = parameters[2].valueAsText.strip().replace(" ", "_")
        out_root = parameters[3].valueAsText
        make_zip = bool(parameters[4].value)

        stamp = datetime.date.today().strftime("%Y%m%d")
        target = os.path.join(out_root, "{}_{}".format(project, stamp))
        os.makedirs(target, exist_ok=True)

        copied = 0
        for root, _dirs, files in os.walk(src):
            for fname in files:
                if any(fnmatch.fnmatch(fname.lower(), p.lower()) for p in patterns):
                    ext = os.path.splitext(fname)[1].lstrip(".").upper() or "OTHER"
                    sub = os.path.join(target, ext)
                    os.makedirs(sub, exist_ok=True)
                    shutil.copy2(os.path.join(root, fname), os.path.join(sub, fname))
                    copied += 1
        arcpy.AddMessage("{} file(s) copied to {}".format(copied, target))

        if make_zip and copied:
            archive = shutil.make_archive(target, "zip", target)
            arcpy.AddMessage("Archive created: {}".format(archive))
