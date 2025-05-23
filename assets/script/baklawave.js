import * as THREE from './vendor/three.module.min.js'
import { Pane } from './vendor/tweakpane.min.js'

const storedConfig = localStorage.getItem('config')

const defaultConfig = {
  baklavaWidth: 16,
  baklavaHeight: 16,
  skewFactor: 1,
  columns: 80,
  rows: 80,
  color: {
    // 0x6686c6,
    r: 102,
    g: 134,
    b: 198
  },
  waveSpeed: 0.001,
  waveAmpX: 0.15,
  waveAmpY: 0.1,
  waveFreqX: 3,
  waveFreqY: 2.4,
  angleX: -45,
  angleZ: 140,
  cameraFOV: 25,
  cameraX: 0,
  cameraY: 0,
  cameraZ: 10
}

const config = storedConfig ? JSON.parse(storedConfig) : {
  ...defaultConfig,
  color: {
    ...defaultConfig.color
  }
}

let ctrl
const fun = document.getElementById('fun')
if (fun) {
  fun.addEventListener('click', () => {
    if (ctrl) {
      return
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
    setTimeout(() => {
      initCtrl()
    }, 300)
  })
}

function initCtrl() {
  ctrl = new Pane({
    title: 'animation settings',
    expanded: true,
  })

  ctrl.addBinding(config, 'baklavaWidth', {
    min: 1,
    max: 100,
    step: 1,
    label: 'tile width',
  })

  ctrl.addBinding(config, 'baklavaHeight', {
    min: 1,
    max: 100,
    step: 1,
    label: 'tile height',
  })

  ctrl.addBinding(config, 'skewFactor', {
    min: 0,
    max: 5,
    step: 0.1,
    label: 'tile skew',
  })

  ctrl.addBinding(config, 'columns', {
    min: 1,
    max: 500,
    step: 1,
    label: 'columns',
  })

  ctrl.addBinding(config, 'rows', {
    min: 1,
    max: 500,
    step: 1,
    label: 'rows',
  })

  ctrl.addBinding(config, 'color', {
    min: 1,
    max: 500,
    step: 1,
    label: 'color',
  })

  ctrl.addBinding(config, 'waveSpeed', {
    min: 0.0001,
    max: 0.03,
    step: 0.00001,
    label: 'speed',
  })

  ctrl.addBinding(config, 'waveAmpX', {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'wavelength x',
  })

  ctrl.addBinding(config, 'waveAmpY', {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'wavelength y',
  })

  ctrl.addBinding(config, 'waveFreqX', {
    min: 0,
    max: 31.415,
    step: 0.1,
    label: 'frequency x',
  })

  ctrl.addBinding(config, 'waveFreqY', {
    min: 0,
    max: 31.415,
    step: 0.1,
    label: 'frequency y',
  })

  ctrl.addBinding(config, 'angleX', {
    min: -180,
    max: 180,
    step: 0.1,
    label: 'rotate x',
  })

  ctrl.addBinding(config, 'angleZ', {
    min: -180,
    max: 180,
    step: 0.1,
    label: 'rotate z',
  })

  ctrl.addBinding(config, 'cameraX', {
    min: -100,
    max: 40,
    step: 0.01,
    label: 'pan x',
  })

  ctrl.addBinding(config, 'cameraY', {
    min: -100,
    max: 40,
    step: 0.01,
    label: 'pan y',
  })

  ctrl.addBinding(config, 'cameraFOV', {
    min: 1,
    max: 180,
    step: 0.1,
    label: 'fov',
  })

  ctrl.addBinding(config, 'cameraZ', {
    min: 0,
    max: 100,
    step: 0.01,
    label: 'zoom',
  })

  const resetButton = ctrl.addButton({
    title: 'Reset',
    label: 'factory settings'
  })

  if (document.location.href.match(/\?design/)) {
    const exportButton = ctrl.addButton({
      title: 'Export'
    })

    exportButton.on('click', () => {
      alert(JSON.stringify(config, null, 2))
    })
  }

  resetButton.on('click', () => {
    for (let key in defaultConfig) {
      if (defaultConfig.hasOwnProperty(key)) {
        if (typeof defaultConfig[key] === 'object') {
          config[key] = {
            ...defaultConfig[key]
          }
        } else {
          config[key] = defaultConfig[key]
        }
      }
    }
    sync({ all: true })
    ctrl.refresh()
    saveLocalStorage()
  })

  ctrl.on('change', sync)
}

function syncBaklava() {
  deleteLines()
  const newLines = createLines()
  wireframe = newLines.wireframe
  lineGeometry = newLines.lineGeometry
  scene.add(wireframe)
}

function syncRotateX() {
  wireframe.rotation.x = Math.PI / 180 * config.angleX
}

function syncRotateZ() {
  wireframe.rotation.z = Math.PI / 180 * config.angleZ
}

function syncCameraPanX() {
  camera.position.x = config.cameraX
  camera.updateProjectionMatrix()
}

function syncCameraPanY(cameraY) {
  camera.position.y = cameraY || config.cameraY
  camera.updateProjectionMatrix()
}

function syncCameraZ(cameraZ) {
  camera.position.z = cameraZ || config.cameraZ
  camera.updateProjectionMatrix()
}

function syncCameraFOV() {
  camera.fov = config.cameraFOV
  camera.updateProjectionMatrix()
}

function saveLocalStorage() {
  localStorage.setItem('config', JSON.stringify(config))
}

function sync(event) {
  if (event.all) {
    syncBaklava()
    syncRotateX()
    syncRotateZ()
    syncCameraPanX()
    syncCameraPanY()
    syncCameraZ()
    syncCameraFOV()
    return
  }
  switch (event.target.controller.view.labelElement.innerText) {
    case 'tile width':
    case 'tile height':
    case 'tile skew':
    case 'columns':
    case 'rows':
    case 'color':
      syncBaklava()
      break
    case 'rotate x':
      syncRotateX()
      break
    case 'rotate z':
      syncRotateZ()
      break
    case 'pan x':
      syncCameraPanX()
      break
    case 'pan y':
      syncCameraPanY()
      break
    case 'zoom':
      syncCameraZ()
      break
    case 'fov':
      syncCameraFOV()
      break
  }
  saveLocalStorage()
}

kicss.reportVariable('--vh', () => window.innerHeight)

window.addEventListener('scroll', onWindowScroll)

// Scene setup
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  config.cameraFOV,
  window.innerWidth / window.innerHeight,
  0.1, 1000
)
camera.position.set(
  config.cameraX,
  config.cameraY,
  config.cameraZ,
)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
baklawaveContainer.insertAdjacentElement('afterBegin', renderer.domElement)
renderer.domElement.id = 'baklawave'

function onWindowResize() {
  const { innerWidth, innerHeight } = window
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
}

function onWindowScroll() {
  const { scrollTop, scrollHeight } = document.documentElement
  const { innerHeight } = window
  const progress = scrollTop / innerHeight
  syncCameraPanY(-3 * progress)
  syncCameraZ(config.cameraZ + -10 * progress)
}

function createLines() {
  // Generate parallelogram-shaped quads manually
  const vertices = []
  const edges = []

  // Create quads with skewed positions (parallelograms)
  for (let i = 0; i <= config.rows; i++) {
    for (let j = 0; j <= config.columns; j++) {
      const x = (j / config.columns - 0.5) * config.baklavaWidth
      const y = (i / config.rows - 0.5) * config.baklavaHeight
      const skewX = y * config.skewFactor // Skew applied based on Y
      vertices.push(x + skewX, y, 0)
    }
  }

  // Connect vertices into wireframe edges (manual parallelogram outline)
  for (let i = 0; i < config.rows; i++) {
    for (let j = 0; j < config.columns; j++) {
      const index = i * (config.columns + 1) + j
      const nextRowIndex = (i + 1) * (config.columns + 1) + j

      // Connect edges for parallelogram structure (without diagonals)
      edges.push(index, index + 1) // Horizontal edge
      edges.push(index, nextRowIndex) // Vertical edge
    }
  }

  // Create geometry for custom wireframe
  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  lineGeometry.setIndex(edges)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: `rgb(${~~config.color.r}, ${~~config.color.g}, ${~~config.color.b})`
  })
  const wireframe = new THREE.LineSegments(lineGeometry, lineMaterial)
  wireframe.rotation.x = Math.PI / 180 * config.angleX
  wireframe.rotation.z = Math.PI / 180 * config.angleZ

  return {
    lineGeometry,
    wireframe
  }
}

function deleteLines() {
  scene.remove(wireframe)
  if (wireframe.geometry) wireframe.geometry.dispose()
  if (wireframe.material) {
    if (Array.isArray(wireframe.material)) {
      wireframe.material.forEach(mat => mat.dispose())
    } else {
      wireframe.material.dispose()
    }
  }
}

let { lineGeometry, wireframe } = createLines()
scene.add(wireframe)

// Animate the waving effect
function animateWave() {
  const time = Date.now() * config.waveSpeed
  const position = lineGeometry.attributes.position

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = (
      Math.sin(x * config.waveFreqX + time) * config.waveAmpX +
      Math.cos(y * config.waveFreqY + time) * config.waveAmpY
    )
    position.setZ(i, z)
  }

  lineGeometry.attributes.position.needsUpdate = true
}

// Animation loop
function animate() {
  requestAnimationFrame(animate)
  animateWave()
  renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', onWindowResize)
onWindowScroll()
