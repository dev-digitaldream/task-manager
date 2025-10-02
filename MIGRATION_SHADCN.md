# Migration vers shadcn/ui — Design épuré monochrome

## État actuel
- ✅ shadcn/ui installé et configuré
- ✅ Composants de base ajoutés (Button, Card, Input, Badge, Dialog, etc.)
- ✅ Alias `@/` configuré dans vite.config.js et jsconfig.json
- ✅ Nouveau Dashboard épuré créé (`DashboardClean.jsx`)

## Composants shadcn/ui installés
```bash
- button
- card
- input
- label
- select
- checkbox
- textarea
- badge
- separator
- dialog
- dropdown-menu
```

## Palette de couleurs épurée (monochrome)

La palette est définie dans `client/src/index.css` avec les variables CSS suivantes:

### Mode clair
- **Background**: Blanc/Gris très clair
- **Foreground**: Gris très foncé (presque noir)
- **Primary**: Noir
- **Secondary**: Gris moyen
- **Muted**: Gris très clair
- **Accent**: Gris clair
- **Border**: Gris clair

### Mode sombre
- **Background**: Noir/Gris très foncé
- **Foreground**: Blanc/Gris très clair
- **Primary**: Blanc
- **Secondary**: Gris foncé
- **Muted**: Gris moyen-foncé
- **Accent**: Gris moyen
- **Border**: Gris foncé

## Migration des composants existants

### Priorité 1 - Composants principaux
1. **TaskList.jsx** → Utiliser `Card`, `Badge`, `Button`, `Checkbox`
2. **TaskForm.jsx** → Utiliser `Input`, `Textarea`, `Select`, `Label`, `Button`
3. **Dashboard.jsx** → Remplacer par `DashboardClean.jsx` (déjà fait)
4. **UserManagement.jsx** → Utiliser `Dialog`, `Input`, `Button`

### Priorité 2 - Composants secondaires
5. **AdminPanel.jsx** → Utiliser `Card`, `Badge`, `Button`, `Dialog`
6. **Analytics.jsx** → Utiliser `Card` pour les graphiques
7. **CalendarModal.jsx** → Utiliser `Dialog`, `Input`, `Button`
8. **UserSettings.jsx** → Utiliser `Card`, `Checkbox`, `Input`, `Button`

### Priorité 3 - Composants utilitaires
9. **CommentSection.jsx** → Utiliser `Card`, `Textarea`, `Button`
10. **FileUpload.jsx** → Utiliser `Card`, `Button`
11. **HistoryPanel.jsx** → Utiliser `Card`, `Badge`

## Pattern de migration (exemple)

### Avant (Tailwind classique avec couleurs)
```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-600">
  <h3 className="font-bold text-lg">Titre</h3>
  <p className="text-blue-100">Description</p>
</div>
```

### Après (shadcn/ui épuré monochrome)
```jsx
<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Description</p>
  </CardContent>
</Card>
```

## Avantages du nouveau design

1. **Accessibilité** — Contraste optimal, respect WCAG 2.1
2. **Cohérence** — Variables CSS centralisées
3. **Dark mode natif** — Basculement automatique via `dark:` classes
4. **Performance** — Composants optimisés, tree-shaking
5. **Maintenabilité** — Moins de classes Tailwind custom, code plus propre

## Commandes utiles

### Ajouter un nouveau composant shadcn/ui
```bash
cd client
npx shadcn@latest add [component-name]
```

### Composants supplémentaires disponibles
```bash
npx shadcn@latest add alert
npx shadcn@latest add avatar
npx shadcn@latest add calendar
npx shadcn@latest add command
npx shadcn@latest add context-menu
npx shadcn@latest add hover-card
npx shadcn@latest add popover
npx shadcn@latest add progress
npx shadcn@latest add radio-group
npx shadcn@latest add scroll-area
npx shadcn@latest add sheet
npx shadcn@latest add skeleton
npx shadcn@latest add slider
npx shadcn@latest add switch
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add toggle
npx shadcn@latest add tooltip
```

## Prochaines étapes

1. ✅ Installer shadcn/ui et composants de base
2. ✅ Créer `DashboardClean.jsx` comme référence
3. ⏳ Migrer `TaskList.jsx` vers shadcn/ui
4. ⏳ Migrer `TaskForm.jsx` vers shadcn/ui
5. ⏳ Remplacer les couleurs custom (bleu/vert/rouge) par des variantes monochromes
6. ⏳ Tester le dark mode sur tous les composants
7. ⏳ Optimiser les animations et transitions

## Notes de design

- **Pas de couleurs vives** — Remplacer `bg-blue-500`, `text-green-600`, etc. par `bg-primary`, `text-muted-foreground`
- **Badges monochromes** — Utiliser `variant="outline"` ou `variant="secondary"`
- **Boutons épurés** — Préférer `variant="outline"` ou `variant="ghost"` aux boutons pleins
- **Espacement généreux** — Privilégier `p-6`, `gap-4`, etc. pour un design aéré
- **Typographie claire** — Utiliser les classes Tailwind de base: `text-sm`, `font-medium`, `tracking-tight`

## Ressources
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Palette de couleurs](https://ui.shadcn.com/themes)
- [Composants disponibles](https://ui.shadcn.com/docs/components)
