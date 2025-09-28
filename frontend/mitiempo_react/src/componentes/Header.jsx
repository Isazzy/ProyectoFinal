import {Link} from "react-router-dom"

export default function Header() {
  return (
    <nav className=' py-4 mb-2'>
        <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-x1 font-bold">Usuarios App</Link>
            <div>
                <Link to="/nuevo-usuario" className="text-x1 font-bold">Nuevo usuario</Link>
            </div>

        </div>

    </nav>
  )
}
