import WalletMultiButton from './wallet-multi-button'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@nextui-org/react'
import { Tooltip } from '@nextui-org/react'
import Image from 'next/image'
import Logo from '../public/logo_full_white.png'

export function NavBar() {
  return (
    <Navbar maxWidth="md">
      <NavbarBrand>
        <Image src={Logo} alt="Nemeos Logo" width={200} />
      </NavbarBrand>
      <NavbarContent justify="end">
        {/* <Tooltip placement="bottom" content="Devnet Only"> */}
        <NavbarItem>
          <WalletMultiButton />
        </NavbarItem>
        {/* </Tooltip> */}
      </NavbarContent>
    </Navbar>
  )
}
