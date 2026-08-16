import { Outlet } from 'react-router-dom'
import BrandHeader from '../../components/BrandHeader/BrandHeader.jsx'

function CreationFlowLayout() {
  return (
    <>
      <BrandHeader />
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default CreationFlowLayout
