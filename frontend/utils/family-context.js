import { familyChildren } from './family-children.js'
import { loadMyProfile } from '../services/perfil-service.js'

export async function loadFamilyContext() {
  const profile = await loadMyProfile()
  const isResponsible = profile?.profile_type === "responsible"
  const children = isResponsible ? ((await familyChildren()) ?? []) : []

  return { profile, isResponsible, children, hasChildren: children.length > 0 }
}
