import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { odontogramaService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import FindingSelector from './FindingSelector';

/**
 * Odontograma 3D de Alta Fidelidad V12.5 (Cinematic Dark Edition - Data Precise)
 * Enfoque: Fondo oscuro profundo con iluminación de alto contraste.
 * INTEGRACIÓN: Manejo preciso de IDs de base de datos para persistencia ORDS.
 */
const Odontograma3D = () => {
    const { id: pacienteId } = useParams();
    const { usuario, empresaActiva } = useAuth();
    const mountRef = useRef(null);
    const teethGroupRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [odontograma, setOdontograma] = useState(null);
    const odontogramaRef = useRef(null); // Ref para evitar problemas de closure en Three.js
    const [selection, setSelection] = useState(null);

    const ESTADOS_COLORES = {
        'SANO': '#FFFFFF',
        'CARIES': '#F87171',
        'OBTURADO': '#60A5FA',
        'AUSENTE': '#94A3B8',
        'CORONA': '#C084FC',
        'ENDODONCIA': '#FBBF24',
        'IMPLANTE': '#2DD4BF',
        'PROTESIS': '#FB923C',
        'FRACTURADO': '#E11D48',
        'EXTRACCION_INDICADA': '#000000'
    };

    // --- Carga de datos desde el Backend ---
    const loadOdontograma = async () => {
        setLoading(true);
        try {
            console.log("3D Debug: Fetching for patient:", pacienteId, "Empresa:", empresaActiva?.empresa_id);
            const response = await odontogramaService.getActual(pacienteId, empresaActiva?.empresa_id);
            console.log("3D Debug: RAW API Response:", response.data);

            const data = response.data;
            // Intentamos obtener los dientes de cualquier lugar posible
            const teethData = data.items || data.dientes || data.data || [];

            if (teethData && teethData.length > 0) {
                const first = teethData[0];
                console.log("3D Debug: First tooth RAW:", first);
                console.log("3D Debug: First tooth JSON:", JSON.stringify(first));
                console.log("3D Debug: First tooth Keys:", Object.keys(first));

                // Helper definitivo para casing
                const getAny = (obj, key) => {
                    if (!obj) return undefined;
                    const keys = Object.keys(obj);
                    const target = key.toLowerCase();
                    const foundKey = keys.find(k => k.toLowerCase() === target);
                    return foundKey ? obj[foundKey] : undefined;
                };

                // Si el primer registro está vacío, buscamos el ID en cualquier otro registro del array
                let odontId = getAny(first, 'odontograma_id') || getAny(data, 'odontograma_id');
                if (!odontId) {
                    const validRecord = teethData.find(d => Object.keys(d).length > 0);
                    if (validRecord) odontId = getAny(validRecord, 'odontograma_id');
                }

                const info = {
                    odontograma_id: odontId || 1, // Fallback extremo
                    fecha: getAny(first, 'fecha_creacion'),
                    dientes: teethData
                };

                setOdontograma(info);
                odontogramaRef.current = info;
                updateTeethMaterials(teethData);
                console.log("3D Debug: Load Success. ID:", info.odontograma_id);
            } else {
                console.warn("3D Debug: Empty teeth array received");
                setOdontograma(null);
            }
        } catch (error) {
            console.error("3D Debug: Error loading:", error);
            setOdontograma(null);
        } finally {
            setLoading(false);
        }
    };

    const handleInitialize = async () => {
        setLoading(true);
        try {
            console.log("3D: Initializing new odontograma...");
            await odontogramaService.create({
                paciente_id: pacienteId,
                tipo: 'PERMANENTE',
                empresa_id: empresaActiva?.empresa_id,
                creado_por: usuario?.usuario_id
            });
            await loadOdontograma();
        } catch (error) {
            console.error("3D: Error initializing odontograma:", error);
            alert("Error al inicializar el odontograma.");
        } finally {
            setLoading(false);
        }
    };

    const updateTeethMaterials = (dientes) => {
        if (!teethGroupRef.current) return;

        const getAny = (obj, key) => {
            if (!obj) return undefined;
            const keys = Object.keys(obj);
            if (keys.length === 0) return undefined;
            const target = key.toLowerCase();
            const foundKey = keys.find(k => k.toLowerCase() === target);
            return foundKey ? obj[foundKey] : undefined;
        };

        // Ordenamos los dientes locales por el mismo criterio que el SQL (Cuadrante, Posicion)
        // para tener un fallback por índice si fallan las keys.
        const sortedMeshes = [...teethGroupRef.current.children].sort((a, b) => {
            const fdiA = a.userData.fdi;
            const fdiB = b.userData.fdi;
            const quadA = Math.floor(fdiA / 10);
            const posA = fdiA % 10;
            const quadB = Math.floor(fdiB / 10);
            const posB = fdiB % 10;
            if (quadA !== quadB) return quadA - quadB;
            return posA - posB;
        });

        sortedMeshes.forEach((toothMesh, index) => {
            const fdi = toothMesh.userData.fdi;
            const dataDiente = dientes[index];

            // Intento 1: Por búsqueda de KEY (Si existen y no están vacías)
            const dataByKey = dientes.find(d => Number(getAny(d, 'numero_fdi')) === fdi);
            const bestData = dataByKey || dataDiente;

            if (bestData) {
                const dbId = getAny(bestData, 'diente_id') || getAny(bestData, 'DIENTE_ID');
                const estado = getAny(bestData, 'estado') || getAny(bestData, 'ESTADO') || 'SANO';

                console.log(`3D: Mapping Tooth ${fdi} (index ${index}) -> DB ID: ${dbId}`);

                toothMesh.userData.dbId = dbId;
                const color = ESTADOS_COLORES[estado] || '#FFFFFF';
                toothMesh.material.color.set(color);

                if (estado === 'AUSENTE' || estado === 'EXTRACCION_INDICADA') {
                    toothMesh.material.transparent = true;
                    toothMesh.material.opacity = 0.2;
                } else {
                    toothMesh.material.transparent = false;
                    toothMesh.material.opacity = 1.0;
                }
            }
        });
    };

    useEffect(() => {
        if (pacienteId) {
            loadOdontograma();
        }
    }, [pacienteId]);

    useEffect(() => {
        const THREE = window.THREE;
        if (!THREE || !mountRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight || 750;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0f172a');
        scene.fog = new THREE.FogExp2('#0f172a', 0.012);

        const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 1000);
        camera.position.set(25, 15, 45);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        mountRef.current.appendChild(renderer.domElement);

        const OrbitControlsClass = window.OrbitControls || THREE.OrbitControls;
        let controls;
        if (OrbitControlsClass) {
            controls = new OrbitControlsClass(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
        }

        const ambient = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambient);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(20, 40, 30);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const fillLight = new THREE.PointLight(0x3b82f6, 0.8, 100);
        fillLight.position.set(-25, 10, 15);
        scene.add(fillLight);

        const toothMaterial = new THREE.MeshStandardMaterial({
            color: '#FFFFFF',
            roughness: 0.1,
            metalness: 0.1,
            emissive: '#ffffff',
            emissiveIntensity: 0.02,
        });

        const createRefinedTooth = (type, fdi) => {
            const points = [];
            if (type === 'molar') {
                points.push(new THREE.Vector2(0, 0), new THREE.Vector2(0.5, 0.2), new THREE.Vector2(0.9, 0.8), new THREE.Vector2(1.1, 1.5), new THREE.Vector2(1.2, 2.2), new THREE.Vector2(0.6, 2.5), new THREE.Vector2(0, 2.5));
            } else if (type === 'canine') {
                points.push(new THREE.Vector2(0, 0), new THREE.Vector2(0.3, 0.2), new THREE.Vector2(0.6, 1.5), new THREE.Vector2(0.8, 2.2), new THREE.Vector2(0.2, 3.4), new THREE.Vector2(0, 3.4));
            } else {
                points.push(new THREE.Vector2(0, 0), new THREE.Vector2(0.3, 0.1), new THREE.Vector2(0.5, 1.0), new THREE.Vector2(0.7, 2.5), new THREE.Vector2(0.2, 3.0), new THREE.Vector2(0, 3.0));
            }

            const geometry = new THREE.LatheGeometry(points, 48);
            if (type === 'incisor') geometry.scale(1.2, 0.95, 0.4);

            const mesh = new THREE.Mesh(geometry, toothMaterial.clone());
            mesh.castShadow = true;
            mesh.userData = { fdi, type };
            return mesh;
        };

        const teethUpper = [17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27];
        const teethLower = [47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37];

        const teethGroup = new THREE.Group();
        teethGroupRef.current = teethGroup;
        scene.add(teethGroup);

        const populateArch = (isUpper) => {
            const list = isUpper ? teethUpper : teethLower;
            const rx = 10.5;
            const rz = 11.5;

            list.forEach((fdi, i) => {
                const angle = (i / (list.length - 1)) * Math.PI - Math.PI / 2;
                const d = Math.abs(i - 6.5);

                const type = d < 2.5 ? 'incisor' : (d < 4 ? 'canine' : 'molar');
                const x = Math.cos(angle) * rx;
                const z = Math.sin(angle) * rz;
                const y = isUpper ? 4.8 : -4.8;

                const tooth = createRefinedTooth(type, fdi);
                tooth.position.set(x, y, z);
                tooth.rotation.y = -angle + Math.PI / 2;
                tooth.rotation.x = isUpper ? Math.PI : 0;
                teethGroup.add(tooth);
            });
        };

        populateArch(true);
        populateArch(false);

        // Si ya tenemos datos del odontograma, actualizamos los materiales de inmediato
        // para asegurar que los dbId se asignen a los meshes.
        if (odontograma && odontograma.dientes) {
            console.log("3D: Data already available on mount, updating materials...");
            updateTeethMaterials(odontograma.dientes);
        }

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onPointerDown = (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(teethGroup.children);

            if (intersects.length > 0) {
                const object = intersects[0].object;

                // Usamos el ref para asegurar que tenemos la versión más reciente
                const currentOdont = odontogramaRef.current;

                if (!currentOdont) {
                    console.warn("3D: Cannot select tooth - No active odontograma in Ref");
                    return;
                }

                teethGroup.children.forEach(t => {
                    t.material.emissiveIntensity = 0.02;
                    t.material.emissive.setHex(0xffffff);
                });
                object.material.emissive.setHex(0x3b82f6);
                object.material.emissiveIntensity = 0.5;

                // Pre-cargamos el historial vacío mientras buscamos
                const basicSelection = {
                    fdi: object.userData.fdi,
                    dbId: object.userData.dbId,
                    surface: 'General',
                    history: []
                };
                setSelection(basicSelection);

                // Fetch historial
                if (object.userData.dbId) {
                    odontogramaService.getHallazgosDiente(object.userData.dbId)
                        .then(res => {
                            setSelection(prev => {
                                // Solo actualizamos si sigue seleccionado el mismo diente
                                if (prev && prev.dbId === object.userData.dbId) {
                                    return { ...prev, history: res.data.items || [] }; // ORDS returns items array
                                }
                                return prev;
                            });
                        })
                        .catch(err => console.error("Error cargando historial:", err));
                }
            }
        };

        renderer.domElement.addEventListener('pointerdown', onPointerDown);

        const animate = () => {
            requestAnimationFrame(animate);
            if (controls) controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
            renderer.dispose();
        };
    }, []);

    const handleSelectFinding = async (estadoId, obs, tratamiento = null) => {
        if (!odontograma) return;

        if (!selection || !selection.dbId) {
            alert("Error: No se pudo identificar la pieza dental en la base de datos.");
            return;
        }

        setLoading(true);
        try {
            // 1. Registramos el hallazgo clínico detallado
            await odontogramaService.registrarHallazgo({
                diente_id: selection.dbId,
                odontograma_id: odontograma.odontograma_id,
                tipo_hallazgo: estadoId,
                descripcion: obs,
                doctor_id: usuario?.usuario_id,
                empresa_id: empresaActiva?.empresa_id
            });

            // 2. Actualizamos el estado general del diente para reflejarlo en el modelo
            await odontogramaService.actualizarDiente(odontograma.odontograma_id, {
                numero_fdi: selection.fdi,
                estado: estadoId,
                observaciones: obs,
                modificado_por: usuario?.usuario_id
            });

            // 3. Si se seleccionó un tratamiento, lo asignamos al diente
            if (tratamiento) {
                const catalogoId = tratamiento.id || tratamiento.ID || tratamiento.catalogo_id || tratamiento.CATALOGO_ID;
                if (catalogoId) {
                    await odontogramaService.asignarTratamiento(selection.dbId, catalogoId, usuario?.usuario_id);
                    console.log("3D: Tratamiento asignado:", tratamiento.nombre || tratamiento.NOMBRE);
                }
            }

            await loadOdontograma();
            setSelection(null);
        } catch (error) {
            console.error("Error al registrar hallazgo:", error);
            alert("Error al guardar el hallazgo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-1000">
            <div className="relative bg-[#0f172a] rounded-[2rem] border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden min-h-[600px] group cursor-grab active:cursor-grabbing">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-white/5 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Conectando Datos...</p>
                        </div>
                    </div>
                )}
                <div ref={mountRef} className="w-full h-[750px]"></div>

                {/* Empty State Overlay */}
                {!loading && !odontograma && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-40 transition-all animate-in fade-in duration-500">
                        <div className="bg-slate-900/90 p-12 rounded-[3.5rem] border border-white/10 shadow-2xl flex flex-col items-center gap-8 text-center max-w-md">
                            <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-primary/20 animate-bounce">🦷</div>
                            <div className="space-y-3">
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Sin Odontograma Activo</h4>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    Este paciente aún no tiene un registro dental iniciado. Pulse el botón para generar el odontograma base.
                                </p>
                            </div>
                            <button
                                onClick={handleInitialize}
                                className="w-full bg-primary hover:bg-blue-600 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-xs"
                            >
                                Inicializar Mapa Dental
                            </button>
                        </div>
                    </div>
                )}

                {selection && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-auto">
                        <FindingSelector
                            toothPos={selection.fdi}
                            surface={selection.surface}
                            dienteId={selection.dbId}
                            initialHistory={selection.history || []}
                            onSelect={handleSelectFinding}
                            onCancel={() => setSelection(null)}
                        />
                    </div>
                )}

                <div className="absolute top-12 left-12 pointer-events-none flex flex-col gap-3">
                    <span className="bg-primary/95 text-white text-[9px] font-black uppercase tracking-[0.4em] px-8 py-3 rounded-full shadow-2xl">
                        DARK IVORY V12.5
                    </span>
                    <span className="bg-white/5 backdrop-blur-md text-slate-400 text-[8px] font-black uppercase tracking-[0.3em] px-8 py-2.5 rounded-full border border-white/5 w-fit">
                        ID PACIENTE: {pacienteId}
                    </span>
                </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-10 rounded-[3.5rem] flex items-center justify-between shadow-2xl">
                <div className="flex flex-wrap gap-8">
                    {Object.entries(ESTADOS_COLORES).slice(0, 5).map(([label, color]) => (
                        <div key={label} className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Odontograma3D;
