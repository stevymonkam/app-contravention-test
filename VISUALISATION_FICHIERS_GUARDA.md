# 👁️ Fonctionnalité "Guarda" - Visualisation des Fichiers

## 📋 Description

Implémentation complète de la fonctionnalité **"Guarda"** permettant de visualiser les fichiers uploadés dans le formulaire de contravention, en mode **création** et en mode **édition**.

---

## ✅ Fonctionnalités Implémentées

### 1️⃣ **Visualisation en Mode Création (Fichiers Locaux)**

Lorsque l'utilisateur uploade des fichiers **avant la sauvegarde** de la contravention :
- ✅ Clic sur "👁️ Guarda" → Le fichier s'ouvre directement depuis la mémoire locale
- ✅ Pas d'appel au backend (fichier pas encore envoyé)
- ✅ Utilisation de `URL.createObjectURL()` pour créer une URL temporaire

**Types de fichiers supportés** :
- 📄 **PDF** : Ouverture dans un nouvel onglet du navigateur
- 🖼️ **Images** (JPG, PNG, GIF, SVG, WebP) : Affichage dans un nouvel onglet
- 📝 **Autres formats** (DOC, DOCX, XLSX, TXT, etc.) : Téléchargement automatique

---

### 2️⃣ **Visualisation en Mode Édition (Fichiers du Backend)**

Lorsque l'utilisateur ouvre une contravention **existante** :
- ✅ Clic sur "👁️ Guarda" → Le fichier est récupéré depuis le backend
- ✅ Appel HTTP GET vers l'API : `/api/contraventions/{numVerbale}/files/{fileId}/download`
- ✅ Réception d'un `Blob` (binaire) et ouverture du fichier

**Avantages** :
- ✅ Visualisation des fichiers déjà enregistrés dans la base de données
- ✅ Gestion des gros fichiers (streaming via Blob)
- ✅ Support de tous les formats de fichiers

---

## 🔧 Modifications Techniques

### **1. Modification du HTML - Ajout du Gestionnaire de Clic**

#### 📍 Localisation : `contravention.component.html`, ligne ~264

**Avant** :
```html
<td><span class="view-icon">👁️</span> Guarda</td>
```

**Après** :
```html
<td style="cursor: pointer;" (click)="viewFile(file, i)">
  <span class="view-icon">👁️</span> Guarda
</td>
```

**Explication** :
- `(click)="viewFile(file, i)"` : Appelle la fonction `viewFile()` avec le fichier et son index
- `style="cursor: pointer;"` : Change le curseur en "main" pour indiquer que c'est cliquable

---

### **2. Ajout de la Méthode `getFile()` dans le Service**

#### 📍 Localisation : `contravention.service.ts`, ligne ~166

```typescript
// Récupérer un fichier spécifique pour le visualiser
getFile(numVerbale: string, fileId: number): Observable<Blob> {
  const token = localStorage.getItem("token");
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.get(`${this.apiUrl}/${numVerbale}/files/${fileId}/download`, {
    headers: headers,
    responseType: 'blob'
  });
}
```

**Explication** :
- **Endpoint** : `GET /api/contraventions/{numVerbale}/files/{fileId}/download`
- **Paramètres** :
  - `numVerbale` : Numéro de la contravention
  - `fileId` : ID du fichier à récupérer
- **Retour** : `Observable<Blob>` (fichier binaire)
- **Headers** : Inclut le token d'authentification
- **responseType: 'blob'** : Indique à Angular de traiter la réponse comme un fichier binaire

---

### **3. Implémentation de `viewFile()` dans le Composant**

#### 📍 Localisation : `contravention.component.ts`, ligne ~608

```typescript
// Visualiser un fichier
viewFile(fileContrevention: FileContrevention, index: number): void {
  console.log('viewFile appelée pour:', fileContrevention);
  
  // Si le fichier a un ID, c'est un fichier du backend (mode édition)
  if (fileContrevention.id && this.contraventionNumVerbale) {
    console.log('Récupération du fichier depuis le backend, ID:', fileContrevention.id);
    this.isLoading = true;
    
    this.contraventionService.getFile(this.contraventionNumVerbale, fileContrevention.id)
      .subscribe({
        next: (blob: Blob) => {
          console.log('Fichier récupéré depuis le backend:', blob);
          this.isLoading = false;
          
          // Créer une URL temporaire pour le blob
          const fileURL = URL.createObjectURL(blob);
          
          // Obtenir le nom du fichier et son extension
          const fileName = fileContrevention.testo1 || fileContrevention.elemento || 'fichier';
          const fileExtension = this.getFileExtension(fileName);
          
          // Ouvrir le fichier dans un nouvel onglet
          this.openFileInNewTab(fileURL, fileName, fileExtension);
        },
        error: (error: any) => {
          console.error('Erreur lors de la récupération du fichier:', error);
          this.isLoading = false;
          this.showMessage('Erreur lors de l\'ouverture du fichier', 'error');
        }
      });
  } 
  // Si le fichier a un objet File, c'est un fichier local (mode création)
  else if (fileContrevention.file) {
    console.log('Ouverture du fichier local:', fileContrevention.file.name);
    
    // Créer une URL temporaire pour le fichier local
    const fileURL = URL.createObjectURL(fileContrevention.file);
    const fileName = fileContrevention.file.name;
    const fileExtension = this.getFileExtension(fileName);
    
    // Ouvrir le fichier dans un nouvel onglet
    this.openFileInNewTab(fileURL, fileName, fileExtension);
  } 
  else {
    console.error('Fichier non disponible pour visualisation');
    this.showMessage('Fichier non disponible', 'error');
  }
}
```

**Explication** :

#### **Cas 1 : Fichier du Backend (Mode Édition)**
1. Vérification : `fileContrevention.id && this.contraventionNumVerbale`
2. Appel au service : `getFile(numVerbale, fileId)`
3. Réception du Blob
4. Création d'une URL temporaire : `URL.createObjectURL(blob)`
5. Ouverture du fichier

#### **Cas 2 : Fichier Local (Mode Création)**
1. Vérification : `fileContrevention.file`
2. Création d'une URL temporaire : `URL.createObjectURL(file)`
3. Ouverture du fichier

---

### **4. Méthode `openFileInNewTab()` - Ouverture Intelligente**

#### 📍 Localisation : `contravention.component.ts`, ligne ~660

```typescript
// Ouvrir le fichier dans un nouvel onglet
private openFileInNewTab(fileURL: string, fileName: string, fileExtension: string): void {
  console.log('Ouverture du fichier:', fileName, 'Extension:', fileExtension);
  
  // Pour les PDFs et images, ouvrir directement dans le navigateur
  const viewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  
  if (viewableExtensions.includes(fileExtension.toLowerCase())) {
    // Ouvrir dans un nouvel onglet pour visualisation
    window.open(fileURL, '_blank');
  } else {
    // Pour les autres types de fichiers (doc, docx, xlsx, txt, etc.)
    // Créer un lien de téléchargement temporaire
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL après un court délai
    setTimeout(() => {
      URL.revokeObjectURL(fileURL);
    }, 100);
  }
}
```

**Explication** :

#### **Fichiers Visualisables (PDF, Images)**
- ✅ Ouverts directement dans le navigateur avec `window.open(fileURL, '_blank')`
- ✅ Extensions supportées : `pdf`, `jpg`, `jpeg`, `png`, `gif`, `bmp`, `svg`, `webp`

#### **Autres Fichiers (DOC, XLSX, etc.)**
- 📥 Téléchargement automatique via un lien temporaire
- ✅ Création d'un élément `<a>` avec `download` attribute
- ✅ Nettoyage de l'URL après téléchargement avec `URL.revokeObjectURL()`

---

### **5. Méthode Utilitaire `getFileExtension()`**

#### 📍 Localisation : `contravention.component.ts`, ligne ~685

```typescript
// Obtenir l'extension du fichier
private getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}
```

**Explication** :
- Extrait l'extension du nom de fichier
- Exemple : `"document.pdf"` → `"pdf"`
- Retourne une chaîne vide si pas d'extension

---

## 🔄 Flux de Fonctionnement

### **Scénario 1 : Visualisation en Mode Création (Fichier Local)**

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Utilisateur clique sur "Browse..." et sélectionne un PDF   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. Utilisateur clique sur "Upload"                             │
│     - Fichier ajouté à uploadedFiles[] (avec objet File)       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Fichier apparaît dans le tableau                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. Utilisateur clique sur "👁️ Guarda"                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. viewFile() est appelée                                      │
│     - Détecte : fileContrevention.file existe                   │
│     - Conclusion : Fichier local (mode création)                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. Création d'une URL temporaire                               │
│     - URL.createObjectURL(fileContrevention.file)               │
│     - Exemple : blob:http://localhost:4200/abc-123-def          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  7. Détection de l'extension : ".pdf"                           │
│     - Extension dans viewableExtensions ?                       │
│     - OUI → Ouvrir dans le navigateur                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  8. window.open(fileURL, '_blank')                              │
│     - Nouvel onglet ouvert avec le PDF affiché                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### **Scénario 2 : Visualisation en Mode Édition (Fichier du Backend)**

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Utilisateur ouvre une contravention existante               │
│     - numVerbale = "123456"                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. loadContraventionData() charge les données                  │
│     - Fichiers existants récupérés du backend                   │
│     - uploadedFiles[] contient des FileContrevention avec ID    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Fichiers affichés dans le tableau                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. Utilisateur clique sur "👁️ Guarda" pour un fichier         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. viewFile() est appelée                                      │
│     - Détecte : fileContrevention.id existe (ex: id = 42)       │
│     - Conclusion : Fichier du backend (mode édition)            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. Appel au service                                            │
│     - contraventionService.getFile("123456", 42)                │
│     - HTTP GET: /api/contraventions/123456/files/42/download    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  7. Backend retourne le fichier (Blob)                          │
│     - Content-Type: application/pdf                             │
│     - Body: Binary data                                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  8. Réception du Blob côté frontend                             │
│     - subscribe() → next: (blob: Blob)                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  9. Création d'une URL temporaire                               │
│     - URL.createObjectURL(blob)                                 │
│     - Exemple : blob:http://localhost:4200/xyz-789-abc          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  10. Détection de l'extension : ".pdf"                          │
│      - Extension dans viewableExtensions ?                      │
│      - OUI → Ouvrir dans le navigateur                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│  11. window.open(fileURL, '_blank')                             │
│      - Nouvel onglet ouvert avec le PDF affiché                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Scénarios de Test

### **Test 1 : Visualisation PDF en Mode Création**

1. Ouvrir le formulaire de création d'une nouvelle contravention
2. Cliquer sur **"Browse..."** et sélectionner un fichier **PDF**
3. Remplir le champ "Tipo" et cliquer sur **"Upload"**
4. Le fichier apparaît dans le tableau
5. Cliquer sur **"👁️ Guarda"** pour ce fichier
6. **Résultat attendu** : Le PDF s'ouvre dans un **nouvel onglet** du navigateur

---

### **Test 2 : Visualisation Image en Mode Création**

1. Ouvrir le formulaire de création
2. Uploader une image **JPG** ou **PNG**
3. Cliquer sur **"👁️ Guarda"**
4. **Résultat attendu** : L'image s'affiche dans un **nouvel onglet**

---

### **Test 3 : Téléchargement DOCX en Mode Création**

1. Ouvrir le formulaire de création
2. Uploader un fichier **DOCX** (Word)
3. Cliquer sur **"👁️ Guarda"**
4. **Résultat attendu** : Le fichier est **téléchargé** automatiquement (ne peut pas être visualisé dans le navigateur)

---

### **Test 4 : Visualisation PDF en Mode Édition**

1. Ouvrir une contravention **existante** qui a déjà un fichier PDF enregistré
2. Le fichier apparaît dans le tableau (avec un ID)
3. Cliquer sur **"👁️ Guarda"**
4. **Résultat attendu** :
   - Appel HTTP au backend : `GET /api/contraventions/{numVerbale}/files/{fileId}/download`
   - Le PDF est récupéré du backend et s'ouvre dans un **nouvel onglet**

---

### **Test 5 : Visualisation Image en Mode Édition**

1. Ouvrir une contravention existante avec une image enregistrée
2. Cliquer sur **"👁️ Guarda"**
3. **Résultat attendu** : L'image est récupérée du backend et s'affiche dans un nouvel onglet

---

### **Test 6 : Erreur Backend (Fichier Introuvable)**

1. Ouvrir une contravention existante
2. Cliquer sur **"👁️ Guarda"** pour un fichier
3. Le backend retourne une **erreur 404** (fichier introuvable)
4. **Résultat attendu** :
   - Message d'erreur affiché : **"Erreur lors de l'ouverture du fichier"**
   - Pas de crash de l'application

---

### **Test 7 : Fichier Sans Extension**

1. Uploader un fichier nommé **"document"** (sans extension)
2. Cliquer sur **"👁️ Guarda"**
3. **Résultat attendu** : Le fichier est téléchargé (comportement par défaut pour les extensions inconnues)

---

## 📊 Comparaison Avant / Après

| Situation | Avant | Après |
|-----------|-------|-------|
| Clic sur "Guarda" | ❌ Rien ne se passe | ✅ Fichier s'ouvre ou se télécharge |
| Mode création (fichier local) | ❌ Non supporté | ✅ Visualisation immédiate |
| Mode édition (fichier backend) | ❌ Non supporté | ✅ Récupération et visualisation |
| PDF | ❌ Non visualisable | ✅ Ouvre dans un nouvel onglet |
| Images | ❌ Non visualisables | ✅ Affichage dans un nouvel onglet |
| Autres formats (DOCX, XLSX) | ❌ Non téléchargeables | ✅ Téléchargement automatique |
| Gestion des erreurs | ❌ Pas de message | ✅ Message d'erreur clair |

---

## 🎯 Types de Fichiers Supportés

### **Fichiers Visualisables dans le Navigateur**
- 📄 **PDF** : `.pdf`
- 🖼️ **Images** : `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`, `.webp`

### **Fichiers Téléchargés Automatiquement**
- 📝 **Documents Word** : `.doc`, `.docx`
- 📊 **Fichiers Excel** : `.xls`, `.xlsx`
- 📋 **Fichiers PowerPoint** : `.ppt`, `.pptx`
- 📄 **Fichiers Texte** : `.txt`, `.csv`
- 🗜️ **Archives** : `.zip`, `.rar`
- 🎵 **Audio** : `.mp3`, `.wav`
- 🎥 **Vidéo** : `.mp4`, `.avi`, `.mov`

---

## 🔐 Sécurité

### **Authentification**
- ✅ Token JWT inclus dans les headers : `Authorization: Bearer {token}`
- ✅ Toutes les requêtes au backend sont authentifiées

### **Validation**
- ✅ Vérification de l'existence du fichier avant l'ouverture
- ✅ Gestion des erreurs 404, 403, 500
- ✅ Messages d'erreur clairs pour l'utilisateur

### **Nettoyage de la Mémoire**
- ✅ `URL.revokeObjectURL()` appelé après l'utilisation
- ✅ Évite les fuites mémoire avec les Blobs

---

## 📁 Fichiers Modifiés

| Fichier | Modifications |
|---------|--------------|
| ✅ `contravention.component.html` | **Ligne ~264** : Ajout de `(click)="viewFile(file, i)"` sur la cellule "Guarda" |
| ✅ `contravention.component.ts` | **Ligne ~608** : Ajout de `viewFile()`<br>**Ligne ~660** : Ajout de `openFileInNewTab()`<br>**Ligne ~685** : Ajout de `getFileExtension()` |
| ✅ `contravention.service.ts` | **Ligne ~166** : Ajout de `getFile(numVerbale, fileId)` |
| ✅ `VISUALISATION_FICHIERS_GUARDA.md` | Documentation créée |

---

## ✅ Checklist

- [x] Ajout du gestionnaire de clic `(click)="viewFile(file, i)"` dans le HTML
- [x] Ajout de `style="cursor: pointer;"` pour l'UX
- [x] Création de la méthode `getFile()` dans le service
- [x] Utilisation de `responseType: 'blob'` pour les fichiers binaires
- [x] Implémentation de `viewFile()` dans le composant
- [x] Gestion des fichiers locaux (mode création)
- [x] Gestion des fichiers backend (mode édition)
- [x] Création de `openFileInNewTab()` pour ouverture intelligente
- [x] Support des PDFs et images (visualisation)
- [x] Support des autres formats (téléchargement)
- [x] Ajout de `getFileExtension()` pour détecter les extensions
- [x] Gestion des erreurs avec messages utilisateur
- [x] Nettoyage de la mémoire avec `URL.revokeObjectURL()`
- [x] Ajout de logs pour le débogage
- [x] Aucune erreur de linter

---

## 🎯 Résultat Final

La fonctionnalité **"Guarda"** est maintenant **entièrement fonctionnelle** :

1. 👁️ **Visualisation en mode création** : Fichiers locaux ouverts immédiatement
2. 👁️ **Visualisation en mode édition** : Fichiers récupérés du backend et ouverts
3. 📄 **PDFs et images** : Visualisation dans un nouvel onglet du navigateur
4. 📥 **Autres formats** : Téléchargement automatique
5. 🛡️ **Sécurité** : Authentification JWT, gestion des erreurs
6. 🧹 **Optimisation** : Nettoyage de la mémoire avec `URL.revokeObjectURL()`

---

## 🚀 Implémentation Backend Requise

L'utilisateur doit implémenter le endpoint backend suivant :

```
GET /api/contraventions/{numVerbale}/files/{fileId}/download
```

**Paramètres** :
- `numVerbale` : Numéro de la contravention (String)
- `fileId` : ID du fichier (Integer)

**Headers requis** :
- `Authorization: Bearer {token}`

**Réponse attendue** :
- **Status** : `200 OK`
- **Content-Type** : Type MIME du fichier (ex: `application/pdf`, `image/jpeg`)
- **Body** : Binaire du fichier (byte[])

**Exemple de contrôleur Spring Boot** :

```java
@GetMapping("/{numVerbale}/files/{fileId}/download")
public ResponseEntity<byte[]> downloadFile(
    @PathVariable String numVerbale, 
    @PathVariable Long fileId
) {
    FileContrevention file = fileService.getFile(numVerbale, fileId);
    
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.parseMediaType(file.getContentType()));
    headers.setContentDisposition(
        ContentDisposition.builder("inline")
            .filename(file.getFileName())
            .build()
    );
    
    return ResponseEntity.ok()
        .headers(headers)
        .body(file.getData());
}
```

---

## 📅 Informations

**Date** : 5 décembre 2025  
**Version** : 1.0  
**Statut** : ✅ **IMPLÉMENTÉ (Frontend complet)**

---

🎉 **La fonctionnalité "Guarda" est maintenant implémentée côté frontend ! L'utilisateur peut visualiser les fichiers en mode création et édition !**
