"""Pilot scene: the barn's cedar-door gable end and the hall behind it.

Units are metres, estimated from Barn 10.webp and the winter walkthrough.
+Y runs from the apron into the barn, Z is up. Run:
  python barn_doors.py [engine] [first] [last] [out_dir] [res_pct] [exposure] [samples] [step]
"""
import math
import sys

import bpy
from mathutils import Vector

ENGINE = sys.argv[1] if len(sys.argv) > 1 else "CYCLES"
FIRST = int(sys.argv[2]) if len(sys.argv) > 2 else 1
LAST = int(sys.argv[3]) if len(sys.argv) > 3 else 240
OUT = sys.argv[4] if len(sys.argv) > 4 else "/tmp/render/"
PCT = int(sys.argv[5]) if len(sys.argv) > 5 else 100
EXPOSURE = float(sys.argv[6]) if len(sys.argv) > 6 else -2.5
SAMPLES = int(sys.argv[7]) if len(sys.argv) > 7 else 16
STEP = int(sys.argv[8]) if len(sys.argv) > 8 else 1

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.frame_start, scene.frame_end = 1, 240
scene.render.fps = 24


# ------------------------------------------------------------ materials
def material(name, color, rough=0.7, metal=0.0, bump=None, emit=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit:
        bsdf.inputs["Emission Color"].default_value = (*emit[0], 1)
        bsdf.inputs["Emission Strength"].default_value = emit[1]
    if bump:  # (scale, direction, strength): vertical boards or roof seams
        coord = nt.nodes.new("ShaderNodeTexCoord")
        wave = nt.nodes.new("ShaderNodeTexWave")
        wave.wave_type = "BANDS"
        wave.bands_direction = bump[1]
        wave.wave_profile = "SAW"
        wave.inputs["Scale"].default_value = bump[0]
        b = nt.nodes.new("ShaderNodeBump")
        b.inputs["Strength"].default_value = bump[2]
        nt.links.new(coord.outputs["Object"], wave.inputs["Vector"])
        nt.links.new(wave.outputs["Fac"], b.inputs["Height"])
        nt.links.new(b.outputs["Normal"], bsdf.inputs["Normal"])
    return m


SIDING = material("siding", (0.055, 0.05, 0.045), 0.75, bump=(2.4, "X", 0.35))
TRIM = material("trim", (0.03, 0.03, 0.03), 0.6)
ROOF = material("roof", (0.035, 0.04, 0.045), 0.38, 0.6, bump=(1.6, "X", 0.25))
CEDAR = material("cedar", (0.62, 0.28, 0.09), 0.55, bump=(9.0, "Z", 0.08))
PINE = material("pine", (0.78, 0.56, 0.32), 0.6, bump=(5.0, "X", 0.12))
CONCRETE = material("concrete", (0.42, 0.41, 0.39), 0.85)
FLOOR = material("hall_floor", (0.5, 0.49, 0.46), 0.55)
GRAVEL = material("gravel", (0.33, 0.32, 0.3), 0.95)
GRASS = material("grass", (0.09, 0.2, 0.05), 0.9)
FOLIAGE = material("foliage", (0.05, 0.13, 0.04), 0.9)
HILLS = material("hills", (0.2, 0.27, 0.32), 1.0)
GLASS = material("glass", (0.8, 0.85, 0.9), 0.05)
GLASS.node_tree.nodes["Principled BSDF"].inputs["Transmission Weight"].default_value = 1
WHITE = material("white_trim", (0.85, 0.85, 0.82), 0.5)
BLACK = material("black_metal", (0.02, 0.02, 0.02), 0.4, 0.8)
BULB = material("bulb", (1, 0.8, 0.5), emit=((1, 0.75, 0.45), 6))


# ------------------------------------------------------------ helpers
def box(name, x0, x1, y0, y1, z0, z1, mat, parent=None):
    bpy.ops.mesh.primitive_cube_add(
        location=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    )
    o = bpy.context.object
    o.name = name
    o.scale = ((x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2)
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(mat)
    if parent:
        o.parent = parent
    return o


def prism(name, x0, x1, y0, y1, z_eave, z_ridge, mat):
    """Solid gable volume (triangle in X, extruded along Y)."""
    mesh = bpy.data.meshes.new(name)
    xm = (x0 + x1) / 2
    v = [(x0, y0, z_eave), (x1, y0, z_eave), (xm, y0, z_ridge),
         (x0, y1, z_eave), (x1, y1, z_eave), (xm, y1, z_ridge)]
    f = [(0, 1, 2), (5, 4, 3), (0, 3, 4, 1), (1, 4, 5, 2), (2, 5, 3, 0)]
    mesh.from_pydata(v, [], f)
    o = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(o)
    o.data.materials.append(mat)
    return o


def slab(name, pts, thick, mat):
    """A roof panel through four corner points, given thickness."""
    mesh = bpy.data.meshes.new(name)
    n = Vector((0, 0, thick))
    v = [Vector(p) for p in pts] + [Vector(p) + n for p in pts]
    f = [(0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3),
         (3, 7, 4, 0)]
    mesh.from_pydata(v, [], f)
    o = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(o)
    o.data.materials.append(mat)
    return o


def cyl(name, loc, r, depth, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc,
                                        rotation=rot)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(mat)
    return o


# ------------------------------------------------------------ the barn
W, D = 6.1, 18.0          # half width of the two-storey core, depth
EAVE, RIDGE = 6.6, 9.7
DOOR_W, DOOR_H = 1.95, 3.25
BAND = 4.95               # dark trim band / lean-to roof line

# Front wall with the door opening cut out, as four boxes.
box("wall_left", -W, -DOOR_W, -0.15, 0, 0, EAVE, SIDING)
box("wall_right", DOOR_W, W, -0.15, 0, 0, EAVE, SIDING)
box("wall_over_door", -DOOR_W, DOOR_W, -0.15, 0, DOOR_H, EAVE, SIDING)
prism("gable_front", -W, W, -0.15, 0, EAVE, RIDGE, SIDING)
# Side and back walls (only seen from inside).
box("wall_side_l", -W - 0.15, -W, 0, D, 0, EAVE, SIDING)
box("wall_side_r", W, W + 0.15, 0, D, 0, EAVE, SIDING)
box("wall_back", -W, W, D, D + 0.15, 0, EAVE, SIDING)
prism("gable_back", -W, W, D, D + 0.15, EAVE, RIDGE, SIDING)

pitch = (RIDGE - EAVE) / W
slab("roof_l", [(-W - 0.5, -0.7, EAVE - 0.5 * pitch), (0, -0.7, RIDGE),
                (0, D + 0.7, RIDGE), (-W - 0.5, D + 0.7, EAVE - 0.5 * pitch)],
     0.12, ROOF)
slab("roof_r", [(0, -0.7, RIDGE), (W + 0.5, -0.7, EAVE - 0.5 * pitch),
                (W + 0.5, D + 0.7, EAVE - 0.5 * pitch), (0, D + 0.7, RIDGE)],
     0.12, ROOF)
# Cupolas on the ridge.
for y in (5.5, 12.5):
    box("cupola", -0.7, 0.7, y - 0.7, y + 0.7, RIDGE - 0.4, RIDGE + 1.0, SIDING)
    prism("cupola_roof", -0.95, 0.95, y - 0.95, y + 0.95, RIDGE + 1.0, RIDGE + 1.6, ROOF)

box("trim_band", -W, W, -0.22, -0.15, BAND - 0.08, BAND + 0.08, TRIM)

# Lean-tos: an open porch on the left, an enclosed shed on the right.
LT = 4.6
for s in (-1, 1):
    x_in, x_out = s * W, s * (W + LT)
    slab(f"leanto_roof_{s}", [(x_in, -0.6, BAND), (x_out, -0.6, BAND - 1.4),
                              (x_out, D + 0.6, BAND - 1.4), (x_in, D + 0.6, BAND)]
         if s > 0 else
         [(x_out, -0.6, BAND - 1.4), (x_in, -0.6, BAND), (x_in, D + 0.6, BAND),
          (x_out, D + 0.6, BAND - 1.4)], 0.1, ROOF)
    box(f"leanto_fascia_{s}", min(x_in, x_out), max(x_in, x_out), -0.68, -0.55,
        BAND - 1.55, BAND - 1.2, CEDAR)
box("shed_front", W, W + LT - 0.2, -0.1, 0, 0, BAND - 1.45, SIDING)
for x in (-(W + LT - 0.25), W + LT - 0.25):
    for y in (-0.4, 6, 12, 17.6):
        box("post", x - 0.13, x + 0.13, y - 0.13, y + 0.13, 0, BAND - 1.4, CEDAR)
for y0 in (-0.4, 6, 12):  # porch railing on the open side
    box("rail", -(W + LT - 0.25) - 0.05, -(W + LT - 0.25) + 0.05, y0, y0 + 6, 0.95, 1.05, CEDAR)
box("porch_deck", -(W + LT), -W, -0.6, D + 0.6, 0, 0.35, CEDAR)

# Cedar header beam, gooseneck lights and planters.
box("header", -DOOR_W - 0.5, DOOR_W + 0.5, -0.35, -0.15, DOOR_H, DOOR_H + 0.32, CEDAR)
for s in (-1, 1):
    box("corbel", s * (DOOR_W + 0.3) - 0.12, s * (DOOR_W + 0.3) + 0.12, -0.35, -0.15,
        DOOR_H - 0.5, DOOR_H, CEDAR)
    cyl("gooseneck", (s * 2.75, -0.45, DOOR_H + 0.05), 0.16, 0.18, BLACK)
    cyl("lamp", (s * 2.75, -0.45, DOOR_H - 0.05), 0.1, 0.04, BULB)
    cyl("planter", (s * 2.9, -0.5, 0.35), 0.28, 0.7, BLACK)

# Upper cedar doors and balcony.
box("upper_door", -1.05, 1.05, -0.2, -0.15, BAND + 0.1, BAND + 2.1, CEDAR)
box("balcony_floor", -2.6, 2.6, -1.0, -0.15, BAND - 0.05, BAND + 0.1, CEDAR)
for x0, x1 in ((-2.6, -2.5), (2.5, 2.6)):
    box("balcony_side", x0, x1, -1.0, -0.15, BAND + 0.1, BAND + 1.1, CEDAR)
box("balcony_rail", -2.6, 2.6, -1.0, -0.9, BAND + 1.0, BAND + 1.1, CEDAR)
for z in (0.35, 0.6, 0.85):
    box("cable", -2.5, 2.5, -0.97, -0.94, BAND + z, BAND + z + 0.02, BLACK)
cyl("gable_light", (0, -0.4, RIDGE - 1.5), 0.2, 0.2, BLACK)


# ------------------------------------------------------------ sliding doors
def door_leaf(name, x_center):
    root = box(name, x_center - DOOR_W / 2, x_center + DOOR_W / 2, -0.32, -0.24,
               0.02, DOOR_H - 0.02, CEDAR)
    # Frame and X-brace in slightly darker cedar.
    frame = material(name + "_frame", (0.5, 0.21, 0.06), 0.55)
    w, h = DOOR_W, DOOR_H
    for x0, x1, z0, z1 in ((-w / 2, -w / 2 + 0.14, 0, h), (w / 2 - 0.14, w / 2, 0, h),
                           (-w / 2, w / 2, 0, 0.14), (-w / 2, w / 2, h - 0.14, h),
                           (-w / 2, w / 2, h / 2 - 0.07, h / 2 + 0.07)):
        box("frame", x_center + x0, x_center + x1, -0.36, -0.32, z0, z1, frame,
            parent=None).parent = root
    for half in (0, 1):
        zc = h / 4 + half * h / 2
        for sign in (-1, 1):
            b = box("brace", -0.07, 0.07, -0.36, -0.32, -h / 4 * 1.1, h / 4 * 1.1, frame)
            b.location = (x_center, -0.34, zc)
            b.rotation_euler = (0, sign * math.atan2(w - 0.2, h / 2 - 0.2), 0)
            b.parent = root
    # Children were placed in world space; keep them where they are.
    for c in root.children:
        c.matrix_parent_inverse = root.matrix_world.inverted()
    return root


left_leaf = door_leaf("door_left", -DOOR_W / 2)
right_leaf = door_leaf("door_right", DOOR_W / 2)
for leaf, s in ((left_leaf, -1), (right_leaf, 1)):
    home = leaf.location.copy()
    leaf.keyframe_insert("location", frame=30)
    leaf.location = home + Vector((s * (DOOR_W + 0.05), 0, 0))
    leaf.keyframe_insert("location", frame=132)
box("door_track", -2 * DOOR_W - 0.3, 2 * DOOR_W + 0.3, -0.4, -0.3, DOOR_H + 0.02,
    DOOR_H + 0.1, BLACK)


# ------------------------------------------------------------ the hall
HALL_D, CEIL = 15.0, 3.7
box("hall_floor", -W, W, 0, HALL_D, -0.02, 0.0, FLOOR)
box("hall_ceiling", -W, W, 0, HALL_D, CEIL, CEIL + 0.05, PINE)
box("hall_back", -W, W, HALL_D, HALL_D + 0.1, 0, CEIL, PINE)
for s in (-1, 1):
    box("hall_wall", s * W - (0.08 if s > 0 else -0.0), s * W + (0.0 if s > 0 else 0.08),
        0, HALL_D, 0, CEIL, PINE)
box("hall_front_l", -W, -DOOR_W, 0.0, 0.08, 0, CEIL, PINE)
box("hall_front_r", DOOR_W, W, 0.0, 0.08, 0, CEIL, PINE)
box("beam", -W, W, 7.4, 7.7, CEIL - 0.3, CEIL, PINE)
for x in (-2.6, 2.6):
    for y in (4.5, 10.0):
        box("hall_post", x - 0.1, x + 0.1, y - 0.1, y + 0.1, 0, CEIL, PINE)

# Far wall: French doors with a window each side, bright daylight beyond.
box("french_door", -1.0, 1.0, HALL_D - 0.05, HALL_D + 0.15, 0.05, 2.3, GLASS)
box("french_frame_top", -1.08, 1.08, HALL_D - 0.06, HALL_D + 0.02, 2.3, 2.42, WHITE)
box("french_mullion", -0.04, 0.04, HALL_D - 0.06, HALL_D + 0.02, 0.05, 2.3, WHITE)
for x in (-3.6, 3.6):
    box("window", x - 0.6, x + 0.6, HALL_D - 0.05, HALL_D + 0.15, 1.0, 2.3, GLASS)
    box("window_frame", x - 0.66, x + 0.66, HALL_D - 0.06, HALL_D + 0.02, 2.3, 2.38, WHITE)
for name, x0, x1, z0, z1 in (("back_hole_d", -1.0, 1.0, 0.05, 2.3),):
    pass  # glass panes stand in for openings; light enters via the backlight

# Wagon-wheel chandeliers.
for y in (4.0, 11.0):
    bpy.ops.mesh.primitive_torus_add(location=(0, y, CEIL - 0.9), major_radius=0.55,
                                     minor_radius=0.03)
    t = bpy.context.object
    t.data.materials.append(BLACK)
    cyl("chain", (0, y, CEIL - 0.45), 0.015, 0.9, BLACK)
    for k in range(8):
        a = k * math.pi / 4
        cyl("candle", (0.55 * math.cos(a), y + 0.55 * math.sin(a), CEIL - 0.82), 0.04,
            0.12, BULB)
    light = bpy.data.lights.new("chandelier", "POINT")
    light.energy, light.color, light.shadow_soft_size = 180, (1, 0.78, 0.5), 0.5
    lo = bpy.data.objects.new("chandelier_light", light)
    lo.location = (0, y, CEIL - 1.0)
    scene.collection.objects.link(lo)

# Fill light so the hall reads as a daylit room, plus daylight past the far wall.
fill = bpy.data.lights.new("hall_fill", "AREA")
fill.shape, fill.size, fill.size_y = "RECTANGLE", 10, 13
fill.energy, fill.color = 350, (1, 0.93, 0.85)
fo = bpy.data.objects.new("hall_fill", fill)
fo.location = (0, HALL_D / 2, CEIL - 0.05)
scene.collection.objects.link(fo)
back = bpy.data.lights.new("daylight_back", "AREA")
back.size, back.energy, back.color = 8, 1500, (1, 0.95, 0.88)
bo = bpy.data.objects.new("daylight_back", back)
bo.location = (0, HALL_D + 1.5, 1.6)
bo.rotation_euler = (math.radians(90), 0, 0)
scene.collection.objects.link(bo)

# ------------------------------------------------------------ grounds
box("apron", -W - LT, W + LT, -13, 0, -0.03, 0.0, CONCRETE)
box("gravel", -30, 30, -45, -13, -0.05, -0.02, GRAVEL)
box("lawn", -80, 80, -120, 120, -0.08, -0.05, GRASS)
import random

random.seed(4)
for _ in range(70):  # tree line around the hilltop
    a = random.uniform(-math.pi * 0.95, math.pi * 0.05)
    r = random.uniform(28, 45)
    x, y = r * math.cos(a) * 1.3, r * math.sin(a) + 10
    if abs(x) < 16 and y < 0:
        continue
    h = random.uniform(9, 16)
    cyl("trunk", (x, y, h * 0.25), 0.25, h * 0.5, CEDAR)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=h * 0.32,
                                          location=(x, y, h * 0.65))
    c = bpy.context.object
    c.scale.z = 1.25
    c.data.materials.append(FOLIAGE)
for i, (d, h) in enumerate(((220, 30), (320, 45), (450, 60))):  # distant ridges
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, d, -h * 0.2))
    o = bpy.context.object
    o.scale = (d * 1.5, 40, h)
    o.data.materials.append(HILLS)

# ------------------------------------------------------------ sky and sun
world = bpy.data.worlds.new("sky")
scene.world = world
world.use_nodes = True
sky = world.node_tree.nodes.new("ShaderNodeTexSky")
try:
    sky.sky_type = "NISHITA"
except TypeError:
    pass
sky.sun_elevation = math.radians(14)
sky.sun_rotation = math.radians(205)
sky.sun_intensity = 0.6
world.node_tree.links.new(sky.outputs["Color"],
                          world.node_tree.nodes["Background"].inputs["Color"])
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.6
sun = bpy.data.lights.new("sun", "SUN")
sun.energy, sun.color, sun.angle = 3.2, (1, 0.86, 0.68), math.radians(1.5)
so = bpy.data.objects.new("sun", sun)
so.rotation_euler = (math.radians(76), 0, math.radians(-35))
scene.collection.objects.link(so)

# ------------------------------------------------------------ camera
cam = bpy.data.cameras.new("cam")
cam.lens = 26
cam.clip_end = 2000
co = bpy.data.objects.new("cam", cam)
scene.collection.objects.link(co)
scene.camera = co
target = bpy.data.objects.new("target", None)
scene.collection.objects.link(target)
track = co.constraints.new("TRACK_TO")
track.target = target
track.track_axis, track.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"

path = [  # frame, camera, look-at
    (1, (-3.4, -16.0, 3.9), (0.0, 0.0, 3.4)),
    (70, (-1.8, -10.5, 3.0), (0.0, 0.0, 2.6)),
    (140, (-0.3, -4.2, 2.0), (0.0, 6.0, 1.8)),
    (200, (0.0, 2.2, 1.75), (0.1, 12.0, 1.65)),
    (240, (0.15, 6.2, 1.7), (0.3, 16.0, 1.6)),
]
for f, c, t in path:
    co.location, target.location = c, t
    co.keyframe_insert("location", frame=f)
    target.keyframe_insert("location", frame=f)


# ------------------------------------------------------------ render settings
r = scene.render
r.resolution_x, r.resolution_y, r.resolution_percentage = 1280, 720, PCT
r.image_settings.file_format = "PNG"
r.filepath = OUT
if ENGINE == "CYCLES":
    r.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 3
else:
    r.engine = "BLENDER_EEVEE" if "BLENDER_EEVEE" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE_NEXT"
scene.view_settings.view_transform = "AgX"
scene.view_settings.exposure = EXPOSURE

scene.frame_start, scene.frame_end = FIRST, LAST
scene.frame_step = STEP
bpy.ops.render.render(animation=True)
