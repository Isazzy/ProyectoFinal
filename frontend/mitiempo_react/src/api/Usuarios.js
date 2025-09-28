import axios from "axios"

const usuariosApi = axios.create({
    baseURL:"http://127.0.0.1:8000/api/usuarios/"
})

export const getUsuarios=() => usuariosApi.get()
export const getUsuario = (id) => usuariosApi.get(`${id}/`)
export const createUsuarios = (Usuarios) => usuariosApi.post('/', Usuarios)
export const deleteUsuario = (id) => usuariosApi.delete(`${id}/`)
export const updateUsuario = (id, usuario) => usuariosApi.put(`${id}/`, usuario);
