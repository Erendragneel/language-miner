"""Player-specific volumetric mesh, painted projection UVs and continuous skinning.
Reuses only the CC0 skeleton and finger topology; all visible clothing, head,
hair and boot shapes below are built for the Language Miner player reference.
"""
import bpy,bmesh,os,math,json
from mathutils import Vector
from math import sin,cos,pi
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
base='work/base-characters/Universal Base Characters[Standard]/Base Characters/Godot - UE/Superhero_Male_FullBody.gltf'
bpy.ops.import_scene.gltf(filepath=os.path.abspath(base))
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');rig.name='LanguageMinerPlayerRig'
hands=next(o for o in bpy.data.objects if o.name=='SuperHero_Male')
bm=bmesh.new();bm.from_mesh(hands.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if abs(v.co.x)<.705],context='VERTS');bm.to_mesh(hands.data);bm.free();hands.name='Player_Hands'
for o in list(bpy.data.objects):
 if o not in [rig,hands]:bpy.data.objects.remove(o,do_unlink=True)
config=json.load(open('tools/golem-3d/player-textures/projection.json'))
images=[bpy.data.images.load(os.path.abspath('tools/golem-3d/player-textures/'+f)) for f in ['front.png','back.png']]
mats={}
for region in ['Skin','Hair','Jacket','Trousers','Gloves','Boots']:
 for side in range(2):
  m=bpy.data.materials.new(region+('_Back' if side else ''));m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.85;p.inputs['Specular IOR Level'].default_value=.05
  n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=images[side];m.node_tree.links.new(n.outputs['Color'],p.inputs['Base Color']);mats[(region,side)]=m


def interp(stops,z):
 if z<=stops[0][0]:return stops[0][1]
 for (a,u),(b,v) in zip(stops,stops[1:]):
  if z<=b:return u+(v-u)*(z-a)/(b-a)
 return stops[-1][1]
def uv(co,back=False):
 c=config['back' if back else 'front'];x,y,z=co;u=c['center']+(-x if back else x)*c['scale'];v=interp(c['height'],z);
 # Arm projection follows the painted horizontal T-pose, independent of torso height remapping.
 if abs(x)>.205 and 1.34<z<1.56:v=.221-(z-1.456)*(.25 if abs(x)>.49 else .38)
 return (u,1-v)
def body_weights(co):
 x,y,z=co
 if z>=1.50:return {'Head':1} if z>1.56 else {'neck_01':1}
 if z>=1.40 and abs(x)>.17:return {'spine_03':.4,'clavicle_l' if x>0 else 'clavicle_r':.6}
 rows=[(.98,'pelvis'),(1.10,'spine_01'),(1.24,'spine_02'),(1.38,'spine_03')]
 if z<rows[0][0]:return {'pelvis':1}
 for (a,an),(b,bn) in zip(rows,rows[1:]):
  if z<b:
   t=(z-a)/(b-a);return {an:1-t,bn:t}
 return {'spine_03':1}
def limb_weights(co,kind,side):
 t=abs(co[0]) if kind=='arm' else co[2]
 if kind=='arm':
  w=max(0,min(1,(t-.40)/.13));return {'upperarm_'+side:1-w,'lowerarm_'+side:w} if t<.68 else {'lowerarm_'+side:max(0,(.74-t)/.06),'hand_'+side:max(0,min(1,(t-.68)/.06))}
 w=max(0,min(1,(t-.47)/.14));return {'thigh_'+side:w,'calf_'+side:1-w}
def surface(name,verts,faces,region,weights,subdiv=1):
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free();mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.parent=rig
 for side in range(2):mesh.materials.append(mats[(region,side)])
 layer=mesh.uv_layers.new(name='PlayerReference')
 for face in mesh.polygons:
  center=sum((mesh.vertices[i].co for i in face.vertices),Vector())/len(face.vertices);back=face.normal.y>0
  face.material_index=int(back);face.use_smooth=True
  for li in face.loop_indices:layer.data[li].uv=uv(mesh.vertices[mesh.loops[li].vertex_index].co,back)
 groups={}
 for v in mesh.vertices:
  w=weights(v.co);total=sum(w.values())
  for bone,value in w.items():
   if value<=0:continue
   if bone not in groups:groups[bone]=o.vertex_groups.new(name=bone)
   groups[bone].add([v.index],value/total,'REPLACE')
 if subdiv:
  m=o.modifiers.new('Smooth tailored surface','SUBSURF');m.levels=subdiv;m.render_levels=subdiv;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=m.name)
 mod=o.modifiers.new('Continuous skeleton skin','ARMATURE');mod.object=rig
 return o

def rings(name,rows,region,weights,n=24,square=1):
 verts=[];faces=[]
 for z,x,y,rx,ry in rows:
  for k in range(n):
   a=2*pi*k/n;c=cos(a);s=sin(a);verts.append((x+math.copysign(abs(c)**square,c)*rx,y+math.copysign(abs(s)**square,s)*ry,z))
 for j in range(len(rows)-1):
  for k in range(n):faces.append((j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k))
 faces.append(tuple(reversed(range(n))));faces.append(tuple((len(rows)-1)*n+k for k in range(n)))
 return surface(name,verts,faces,region,weights)

rings('Player_Fitted_Jacket',[(.97,0,0,.153,.098),(1.00,0,0,.155,.1),(1.09,0,0,.148,.093),(1.21,0,0,.166,.102),(1.34,0,.006,.196,.115),(1.43,0,.024,.205,.104),(1.48,0,.022,.165,.082),(1.505,0,.018,.068,.062)],'Jacket',body_weights,32)
rings('Player_Neck',[(1.48,0,.018,.044,.041),(1.56,0,.016,.045,.045),(1.61,0,.012,.051,.053)],'Skin',lambda v:{'neck_01':1},24)
# Raised ochre/teal collar follows the upper chest around the neck.
verts=[];faces=[]
for j in range(17):
 a=-.20+3.54*j/16
 for z,r in [(1.475,.079),(1.555,.088)]:
  verts.append((r*cos(a),.012+r*sin(a),z))
for j in range(16):faces.append((j*2,j*2+1,j*2+3,j*2+2))
collar=surface('Player_Raised_Collar',verts,faces,'Jacket',lambda v:{'spine_03':1},1)
for p in collar.data.polygons:
 p.material_index=0
 for li in p.loop_indices:
  co=collar.data.vertices[collar.data.loops[li].vertex_index].co
  collar.data.uv_layers.active.data[li].uv=(.5+co.x*.60,1-(.175+(1.555-co.z)*.38))
# Youthful narrow jaw, soft cheeks, large painted anime eyes and small nose.
headrows=[(1.574,0,-.026,.018,.023),(1.596,0,-.005,.052,.058),(1.635,0,.008,.076,.075),(1.685,0,.013,.095,.086),(1.735,0,.016,.100,.091),(1.79,0,.023,.097,.085),(1.833,0,.025,.075,.064),(1.851,0,.025,.02,.024)]
head=rings('Player_Anime_Face',headrows,'Skin',lambda v:{'Head':1},40)
for v in head.data.vertices:
 if v.co.y<0:
  v.co.y-=.018*math.exp(-(v.co.x/.022)**2-((v.co.z-1.699)/.026)**2)
# Round scalp volume plus individually sculpted swept fringe locks.
rings('Hair_Player',[(1.755,0,.035,.10,.089),(1.79,0,.035,.111,.105),(1.83,0,.037,.103,.093),(1.87,0,.031,.067,.057),(1.883,0,.025,.012,.01)],'Hair',lambda v:{'Head':1},32)
for i,(a,b,c) in enumerate([((-.083,-.077,1.824),(-.10,-.100,1.762),(-.10,-.103,1.70)),((-.048,-.093,1.866),(-.015,-.118,1.80),(-.052,-.121,1.727)),((-.01,-.094,1.872),(.052,-.117,1.81),(.018,-.126,1.73)),((.04,-.09,1.852),(.096,-.104,1.79),(.078,-.107,1.713)),((.082,-.07,1.826),(.113,-.067,1.747),(.101,-.079,1.691))]):
 verts=[]
 for j in range(6):
  t=j/5;p=Vector(a)*(1-t)**2+Vector(b)*2*t*(1-t)+Vector(c)*t*t;w=.025*(1-t)+.002
  verts.extend([tuple(p+Vector((-w,0,0))),tuple(p+Vector((w,0,0))),tuple(p+Vector((0,-.007,0)))])
 faces=[]
 for j in range(5):
  faces.extend([(j*3,(j+1)*3,(j+1)*3+2,j*3+2),(j*3+2,(j+1)*3+2,(j+1)*3+1,j*3+1)])
 surface('Hair_Fringe_'+str(i),verts,faces,'Hair',lambda v:{'Head':1})
for side,sign in [('l',1),('r',-1)]:
 # Elbow is a blended deformation zone, not two disconnected rigid parts.
 verts=[];faces=[];rows=[(.16,.062),(.225,.073),(.29,.08),(.36,.069),(.425,.058),(.46,.057),(.49,.057),(.515,.053)]
 for x,r in rows:
  for k in range(24):a=2*pi*k/24;verts.append((sign*x,.066+r*sin(a),1.456+r*cos(a)))
 for j in range(len(rows)-1):
  for k in range(24):faces.append((j*24+k,j*24+(k+1)%24,(j+1)*24+(k+1)%24,(j+1)*24+k) if sign>0 else (j*24+k,(j+1)*24+k,(j+1)*24+(k+1)%24,j*24+(k+1)%24))
 surface('Player_Rolled_Sleeve_'+side,verts,faces,'Jacket',lambda v:limb_weights(v,'arm',side))
 verts=[];faces=[]
 for x,r in [(.49,.048),(.53,.052),(.59,.046),(.65,.037),(.713,.030)]:
  for k in range(24):a=2*pi*k/24;verts.append((sign*x,.066+r*sin(a),1.456+r*cos(a)))
 for j in range(4):
  for k in range(24):faces.append((j*24+k,j*24+(k+1)%24,(j+1)*24+(k+1)%24,(j+1)*24+k) if sign>0 else (j*24+k,(j+1)*24+k,(j+1)*24+(k+1)%24,j*24+(k+1)%24))
 surface('Player_Forearm_'+side,verts,faces,'Skin',lambda v:limb_weights(v,'arm',side))
 x=sign*.114
 rings('Player_Tailored_Trousers_'+side,[(.29,x,.06,.058,.067),(.35,x,.06,.06,.073),(.46,x,.035,.066,.078),(.54,x,.035,.074,.08),(.60,x,.033,.072,.09),(.73,x,.025,.084,.098),(.89,x,.018,.094,.105),(.98,x,.018,.088,.09)],'Trousers',lambda v:limb_weights(v,'leg',side),28)
 rings('Player_Reinforced_Boot_'+side,[(.005,x,-.073,.085,.163),(.04,x,-.077,.09,.17),(.10,x,-.076,.091,.165),(.145,x,-.05,.08,.136),(.19,x,.015,.065,.086),(.26,x,.052,.059,.060),(.345,x,.045,.064,.068),(.37,x,.045,.067,.071)],'Boots',lambda v:{'foot_'+side:1},32,.65)
# Hands keep high quality weighted finger anatomy with the player's glove texture.
hands.data.materials.clear();hands.data.materials.append(mats[('Gloves',0)]);hands.data.materials.append(mats[('Gloves',1)])
uvlayer=hands.data.uv_layers.active
for p in hands.data.polygons:
 back=p.normal.y>0;p.material_index=int(back);p.use_smooth=True
 for li in p.loop_indices:uvlayer.data[li].uv=uv(hands.data.vertices[hands.data.loops[li].vertex_index].co,back)
# Pelvis join; high waistband prevents gaps when knees and hips bend.
rings('Player_Belt_and_Hips',[(.88,0,.019,.173,.09),(.94,0,.012,.164,.095),(1.015,0,.007,.155,.10)],'Trousers',lambda v:{'pelvis':1},32)
# Broader youthful head, preserving painted feature proportions.
for o in bpy.data.objects:
 if o.type=='MESH' and (o.name=='Player_Anime_Face' or o.name.startswith('Hair_')):
  for v in o.data.vertices:
   v.co.x*=1.20
   v.co.z=1.574+(v.co.z-1.574)*1.05
for o in bpy.data.objects:o.select_set(o.type in ['MESH','ARMATURE'])
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=os.path.abspath('golem-3d-v2/miner.glb'),export_format='GLB',use_selection=True,export_animations=False,export_yup=True,export_extras=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('work/player-faithful-rig.blend'))
print('PLAYER MODEL EXPORTED')
