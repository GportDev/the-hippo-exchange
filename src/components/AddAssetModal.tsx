import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Asset {
  itemName: string
  brandName: string
  category: string
  purchaseDate: string
  purchaseCost: number
  currentLocation: string
  images: string[]
  conditionDescription: string
  status: string
}

interface AddAssetModalProps {
  onAssetAdded: (asset: Asset) => void
}

export default function AddAssetModal({ onAssetAdded }: AddAssetModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Asset>>({
    itemName: '',
    brandName: '',
    category: '',
    purchaseDate: '',
    purchaseCost: 0,
    currentLocation: '',
    images: [''],
    conditionDescription: '',
    status: 'available',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.itemName || !formData.brandName || !formData.category || 
        !formData.purchaseDate || !formData.currentLocation || !formData.conditionDescription) {
      alert('Please fill in all required fields')
      return
    }

    // Create new asset object
    const newAsset: Asset = {
      itemName: formData.itemName,
      brandName: formData.brandName,
      category: formData.category,
      purchaseDate: new Date(formData.purchaseDate).toISOString(),
      purchaseCost: formData.purchaseCost || 0,
      currentLocation: formData.currentLocation,
      images: formData.images?.filter(img => img.trim() !== '') || [''],
      conditionDescription: formData.conditionDescription,
      status: formData.status || 'available',
    }

    onAssetAdded(newAsset)
    
    // Reset form
    setFormData({
      itemName: '',
      brandName: '',
      category: '',
      purchaseDate: '',
      purchaseCost: 0,
      currentLocation: '',
      images: [''],
      conditionDescription: '',
      status: 'available',
    })
    
    setOpen(false)
  }

  const handleInputChange = (field: keyof Asset, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...(formData.images || [''])]
    newImages[index] = value
    setFormData(prev => ({
      ...prev,
      images: newImages
    }))
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || ['']), '']
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Asset</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Fill in the details for your new asset. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => handleInputChange('itemName', e.target.value)}
                placeholder="Enter item name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name *</Label>
              <Input
                id="brandName"
                value={formData.brandName}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
                placeholder="Enter brand name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Electronics, Home & Garden"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseCost">Purchase Cost ($)</Label>
              <Input
                id="purchaseCost"
                type="number"
                step="0.01"
                value={formData.purchaseCost}
                onChange={(e) => handleInputChange('purchaseCost', Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date *</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentLocation">Current Location *</Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                placeholder="e.g., Cookeville, Tennessee"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditionDescription">Condition Description *</Label>
            <Textarea
              id="conditionDescription"
              value={formData.conditionDescription}
              onChange={(e) => handleInputChange('conditionDescription', e.target.value)}
              placeholder="Describe the current condition of the item"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            {formData.images?.map((image, index) => (
              <div key={`image-${index}-${image.slice(-10)}`} className="flex gap-2">
                <Input
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="Image URL"
                />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addImageField}>
              Add Another Image
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Asset</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
