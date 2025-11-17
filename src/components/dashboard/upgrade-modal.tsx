'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Sparkles } from 'lucide-react'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

const freeFeatures = [
  'Anotações ilimitadas',
  'Organização em pastas',
  'Editor de texto rico',
  'Compartilhamento básico',
  'Até 6 colaboradores por nota',
]

const premiumFeatures = [
  'Tudo do plano gratuito',
  'Colaboradores ilimitados',
  'Templates personalizados de RPG',
  'Fichas de personagem interativas',
  'Upload de mapas e imagens',
  'Histórico de versões',
  'Modo offline',
  'Exportação em PDF e Markdown',
  'Temas personalizados',
  'Suporte prioritário',
  'Backup automático',
  'Integração com Discord',
]

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Upgrade para Premium
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Desbloqueie todo o potencial das suas anotações de RPG
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Plano Gratuito */}
          <div className="border rounded-2xl p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Gratuito</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">R$ 0</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>

            <ul className="space-y-3">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button variant="outline" className="w-full" disabled>
              Plano Atual
            </Button>
          </div>

          {/* Plano Premium */}
          <div className="border-2 border-yellow-500 rounded-2xl p-6 space-y-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                <Crown className="mr-1 h-3 w-3" />
                Popular
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                Premium
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  R$ 19,90
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">
                ou R$ 199,00/ano (economize 17%)
              </p>
            </div>

            <ul className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 pt-4">
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold">
                <Crown className="mr-2 h-4 w-4" />
                Assinar Premium
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Cancele quando quiser • Garantia de 7 dias
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-center text-blue-900 dark:text-blue-100">
            <strong>Oferta de Lançamento:</strong> Primeiros 100 usuários ganham 3 meses grátis! 🎉
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
