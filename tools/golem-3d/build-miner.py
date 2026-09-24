"""Build the miner from CC0 Quaternius topology. Blender 4.5; no game save access.
Sources and licenses: golem-3d-v1/LICENSE.txt. Inputs live in work/.
"""
import bpy,bmesh,os,math
from mathutils import Vector
ROOT=os.getcwd()
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
base='work/base-characters/Universal Base Characters[Standard]'
outfits='work/outfits/Modular Character Outfits - Fantasy[Standard]'
bpy.ops.import_scene.gltf(filepath=os.path.abspath(outfits+'/Exports/glTF (Godot-Unreal)/Outfits/Male_Peasant.gltf'))
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');rig.name='MinerSkeleton'
for o in list(bpy.data.objects):
 if o.type=='MESH' and not o.vertex_groups:bpy.data.objects.remove(o,do_unlink=True)
body={o.name:o for o in bpy.data.objects if o.type=='MESH'}
def mat(name,color,metal=0,rough=.7):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
skin=mat('Skin',(0.63,.35,.19),0,.65);cloth=mat('Jacket',(.58,.30,.045));dark=mat('Undershirt',(.026,.038,.045));pants=mat('Trousers',(.045,.10,.17));leather=mat('Leather',(.038,.032,.023));gold=mat('Brass',(.67,.4,.09),.65,.32);metal=mat('Steel',(.22,.31,.35),.65,.3);glove=mat('Gloves',(.045,.045,.037));hairmat=mat('Hair',(.12,.048,.021),0,.6);crystal=mat('Pendant',(.025,.6,.75),.3,.2)
for name,o in body.items():
 old=list(o.data.materials); old_indices=[p.material_index for p in o.data.polygons];o.data.materials.clear()
 for m in [cloth,dark,pants,leather,gold,skin,glove]:o.data.materials.append(m)
 for p in o.data.polygons:
  c=sum((o.data.vertices[i].co for i in p.vertices),Vector())/len(p.vertices);x,y,z=c
  if 'Body' in name:
   p.material_index=1 if (abs(x)<.078 and y<-.02) else 0
   if z<.99:p.material_index=3
  elif 'Legs' in name:p.material_index=2
  elif 'Feet' in name:p.material_index=3
  else:p.material_index=(6 if .70<abs(x)<.813 else 5) if old_indices[p.index]==1 else 0
  p.use_smooth=True
 # Shorten the tunic hem to a working jacket; preserve skin weights.
 if 'Body' in name:
  for v in o.data.vertices:
   if v.co.z<.96:v.co.z=.96+(v.co.z-.96)*.32
 # Rolled cuffs, boot straps and hardware retain their source silhouette.
 if 'Feet' in name:
  for p in o.data.polygons:
   c=p.center
   if .12<c.z<.15 or .30<c.z<.33:p.material_index=4
# Import source anatomy and keep only neck/head. Arms come from the matching outfit.
old=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=os.path.abspath(base+'/Base Characters/Godot - UE/Superhero_Male_FullBody.gltf'))
new=list(set(bpy.data.objects)-old); imported_rigs=[o for o in new if o.type=='ARMATURE']
for o in new:
 if o.type=='ARMATURE':continue
 if o.type!='MESH' or not o.vertex_groups:bpy.data.objects.remove(o,do_unlink=True);continue
 o.parent=rig
 for mod in o.modifiers:
  if mod.type=='ARMATURE':mod.object=rig
 if 'SuperHero' in o.name:
  bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z<1.485],context='VERTS');bm.to_mesh(o.data);bm.free();o.name='Face';o.data.materials.clear();o.data.materials.append(skin)
 elif 'Eyebrows' in o.name:o.data.materials.clear();o.data.materials.append(hairmat)
 else:
  # Retain the artist's eye map; smaller packaged texture is sufficient here.
  for m in o.data.materials:
   for n in list(m.node_tree.nodes):
    if n.type=='TEX_IMAGE' and ('Normal' in (n.image.name if n.image else '')):m.node_tree.nodes.remove(n)
   m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.35
 for p in o.data.polygons:p.use_smooth=True
for o in imported_rigs:bpy.data.objects.remove(o,do_unlink=True)
# Reusable hairstyle meshes share the same Head bone. Only one is shown at runtime.
import glob
for style in ['SimpleParted','Buzzed','Long','Buns']:
 path=glob.glob(glob.escape(base)+'/Hairstyles/Origin at 0/**/Hair_'+style+'.gltf',recursive=True)[0]
 old=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=os.path.abspath(path));new=list(set(bpy.data.objects)-old); imported_rigs=[o for o in new if o.type=='ARMATURE']
 for o in new:
  if o.type=='MESH' and 'Icosphere' not in o.name:
   if not o.vertex_groups:
    g=o.vertex_groups.new(name='Head');g.add(list(range(len(o.data.vertices))),1,'REPLACE');m=o.modifiers.new('Skeleton','ARMATURE');m.object=rig
   o.name='Hair_'+style;o.parent=rig;o.data.materials.clear();o.data.materials.append(hairmat)
   for mod in o.modifiers:
    if mod.type=='ARMATURE':mod.object=rig
   for p in o.data.polygons:p.use_smooth=True
  elif o.type!='ARMATURE':bpy.data.objects.remove(o,do_unlink=True)
 for o in imported_rigs:bpy.data.objects.remove(o,do_unlink=True)
# Solid outfit details, bound to real bones rather than overlaid on the picture.
def bind(o,name,bone,material):
 o.name=name;o.data.materials.clear();o.data.materials.append(material);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 # Apply local transforms to mesh so bind coordinates match the skeleton.
 o.data.transform(o.matrix_world);o.matrix_world.identity();o.parent=rig
 g=o.vertex_groups.new(name=bone);g.add(list(range(len(o.data.vertices))),1,'REPLACE');m=o.modifiers.new('Skeleton','ARMATURE');m.object=rig
 for p in o.data.polygons:p.use_smooth=True
 return o
def box(name,loc,scale,bone,material,bevel=.008):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 m=o.modifiers.new('Soft edges','BEVEL');m.width=bevel;m.segments=2;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name);return bind(o,name,bone,material)
box('Belt_buckle',(0,-.133,1.01),(.11,.025,.08),'pelvis',metal)
box('Belt_buckle_inner',(0,-.149,1.01),(.075,.014,.049),'pelvis',gold)
for side in [-1,1]:
 box('Cargo_pocket',(.17*side,-.04,.80),(.10,.14,.14),'thigh_l' if side>0 else 'thigh_r',pants)
 box('Pocket_clasp',(.17*side,-.116,.82),(.028,.012,.04),'thigh_l' if side>0 else 'thigh_r',gold)
 box('Jacket_pocket',(.135*side,-.151,1.30),(.082,.025,.105),'spine_03',cloth)
 box('Pocket_stud',(.135*side,-.168,1.335),(.022,.012,.015),'spine_03',gold)
 box('Shoulder_strap',(.20*side,-.027,1.484),(.057,.21,.028),'clavicle_l' if side>0 else 'clavicle_r',leather)
 box('Strap_buckle',(.20*side,-.098,1.491),(.065,.038,.020),'clavicle_l' if side>0 else 'clavicle_r',gold)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=(0,-.16,1.36));o=bpy.context.object;o.scale=(.023,.014,.042);bind(o,'Golem_pendant','spine_03',crystal)
# Clean missing source normal links; embed only textures actually used in export.
for m in bpy.data.materials:
 if m.use_nodes:
  for n in list(m.node_tree.nodes):
   if n.type=='TEX_IMAGE' and (not n.image or not n.image.has_data):m.node_tree.nodes.remove(n)
for img in bpy.data.images:
 if img.has_data and max(img.size)>512:img.scale(512,512)
# Model is deliberately kept as an editable skinned asset, not flattened artwork.
for o in bpy.data.objects:o.select_set(o.type in ['MESH','ARMATURE'])
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=os.path.abspath('golem-3d-v1/miner.glb'),export_format='GLB',use_selection=True,export_animations=False,export_yup=True,export_extras=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('work/miner-rig.blend'))
print('MINER EXPORTED')

