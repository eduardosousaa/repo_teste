
export type MenuItem = {
  name: string
  path: string
  subtitle?: string 
  hasDropdown?: boolean
  children?: MenuItem[]
}

export type MenuGroup = {
  title: string
  items: MenuItem[]
}
