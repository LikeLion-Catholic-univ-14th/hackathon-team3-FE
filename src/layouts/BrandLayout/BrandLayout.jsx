import { Outlet } from 'react-router-dom'
import BrandHeader from '../../components/BrandHeader/BrandHeader.jsx'

function BrandLayout() {
  return (
    <>
      <BrandHeader />
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default BrandLayout
