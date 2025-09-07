import { defineStore } from 'pinia'
import * as pacienteService from '../services/pacienteService'
import * as consumoService from '../services/consumoService'
import * as pagoService from '../services/pagoService'
import { useAuthStore } from './authStore'

export const usePacienteStore = defineStore('paciente', {
  state: () => ({
    paciente: null,         // { CNRODNI, CAPEPAT, CAPEMAT, CNOMBRE, CNROCEL, CSEXO, DNACIMI, CDNIEST }
    nuevo: false,
    tratamientos: [],       // seleccionados [{ CCODART, CDESCRI, NCANTID, NPRECIO }]
    nroPago: null,
    montoTotal: 0,
    estadoPago: 'PENDIENTE'
  }),
  actions: {
    async buscarPaciente(dni) {
      const auth = useAuthStore()
      const res = await pacienteService.buscar({ CNRODNI: dni, CUSUCOD: auth.user?.CUSUCOD })
      if (res.ERROR) throw new Error(res.ERROR)
      if (res.CNUEVO === 'S') {
        this.nuevo = true
        this.paciente = { 
          CNRODNI: dni, 
          CAPEPAT: '', 
          CAPEMAT: '', 
          CNOMBRE: '', 
          CNROCEL: '',
          CSEXO: 'M',
          DNACIMI: '',
          CDNIEST: ''
        }
      } else {
        this.nuevo = false
        this.paciente = { 
          CNRODNI: res.CNRODNI, 
          CAPEPAT: res.CAPEPAT || '', 
          CAPEMAT: res.CAPEMAT || '', 
          CNOMBRE: res.CNOMBRE || '', 
          CNROCEL: res.CNROCEL || '',
          CSEXO: res.CSEXO || 'M',
          DNACIMI: res.DNACIMI || '',
          CDNIEST: res.CDNIEST || ''
        }
      }
      return res
    },
    async registrarPaciente(pacienteData) {
      const auth = useAuthStore()
      const res = await pacienteService.registrar({ 
        ...pacienteData, 
        CUSUCOD: auth.user?.CUSUCOD 
      })
      if (res.ERROR) throw new Error(res.ERROR)
      this.nuevo = false
      return res
    },
    async cargarTratamientoPorCodigo(CCODART) {
      const res = await consumoService.buscarArticulo({ CCODART })
      if (res.ERROR) throw new Error(res.ERROR)
      const idx = this.tratamientos.findIndex(t => t.CCODART === res.CCODART)
      if (idx >= 0) {
        this.tratamientos[idx].NCANTID += 1
      } else {
        this.tratamientos.push({ ...res, NCANTID: 1 })
      }
      this.montoTotal = this.tratamientos.reduce((acc, t) => acc + t.NPRECIO * t.NCANTID, 0)
      return res
    },
    actualizarCantidad(CCODART, cant) {
      const it = this.tratamientos.find(t => t.CCODART === CCODART)
      if (it) it.NCANTID = Math.max(1, Number(cant)||1)
      this.montoTotal = this.tratamientos.reduce((acc, t) => acc + t.NPRECIO * t.NCANTID, 0)
    },
    quitarTratamiento(CCODART) {
      this.tratamientos = this.tratamientos.filter(t => t.CCODART !== CCODART)
      this.montoTotal = this.tratamientos.reduce((acc, t) => acc + t.NPRECIO * t.NCANTID, 0)
    },
    async grabarConsumo() {
      const auth = useAuthStore()
      if (!this.paciente) throw new Error('Paciente no definido')
      if (this.tratamientos.length === 0) throw new Error('Seleccione al menos un tratamiento')
      const payload = {
        CNRODNI: this.paciente.CNRODNI,
        CUSUCOD: auth.user?.CUSUCOD,
        DATOS: this.tratamientos.map(t => ({ CCODART: t.CCODART, NCANTID: t.NCANTID, NPRECIO: t.NPRECIO }))
      }
      const res = await consumoService.registrarConsumo(payload)
      if (res.ERROR) throw new Error(res.ERROR)
      this.nroPago = res.CNROPAG
      this.montoTotal = res.NMONTO
      this.estadoPago = 'PENDIENTE'
      return res
    },
    async verificarPago() {
      if (!this.nroPago) throw new Error('No hay pago a verificar')
      const res = await pagoService.verificar({ CNROPAG: this.nroPago })
      if (res.OK === 'OK') this.estadoPago = 'PAGADO'
      return res
    }
  }
})
