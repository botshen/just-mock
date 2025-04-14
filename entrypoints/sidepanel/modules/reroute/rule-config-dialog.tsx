import type { PropType } from 'vue'
import { createComponent, fn } from '@/share/create-component'
import { ref } from 'vue'
import { useRerouterStore } from './use-rerouter-store'

interface Options {
  emits: {
    selectOption: (option: string) => void
  }
}

export const RuleConfigDialog = createComponent<Options>({
  emits: {
    selectOption: fn,
  },
}, (props, { emit }) => {
  const { modelRef, closeModal } = useRerouterStore()

  const selectOption = (option: string) => {
    emit('selectOption', option)
    closeModal()
  }

  return () => (
    <dialog ref={modelRef} class="modal">
      <div class="modal-box max-w-3xl">
        <div class="flex border-b">
          <div class="w-1/2 text-center py-4 font-bold text-blue-500 border-b-2 border-blue-500">
            MODS
          </div>
          <div class="w-1/2 text-center py-4 font-bold text-gray-500 relative">
            FILTERS
          </div>
          <form method="dialog" class="absolute right-2 top-2">
            <button
              class="btn btn-sm btn-circle btn-ghost text-gray-400"
              onClick={closeModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>
        </div>

        <div class="py-4">
          <div
            class="flex items-center gap-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            onClick={() => selectOption('replay')}
          >
            <div class="w-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-lg">Replay response</span>
                <span class="bg-red-500 text-white text-xs px-2 py-1 rounded">POPULAR</span>
              </div>
              <div class="text-gray-500">Record and replay HTTP responses</div>
            </div>
          </div>

          <div
            class="flex items-center gap-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            onClick={() => selectOption('reroute')}
          >
            <div class="w-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-lg">Reroute request</span>
                <span class="bg-red-500 text-white text-xs px-2 py-1 rounded">POPULAR</span>
              </div>
              <div class="text-gray-500">Reroute HTTP requests to a different domain</div>
            </div>
          </div>

          <div class="flex items-center gap-4 p-2 rounded-lg opacity-60">
            <div class="w-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-lg">Stub response</span>
                <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Coming soon</span>
              </div>
              <div class="text-gray-500">Respond to HTTP requests with a fake response</div>
            </div>
          </div>

          <div class="flex items-center gap-4 p-2 rounded-lg opacity-60">
            <div class="w-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-lg">Simulate network error</span>
                <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Coming soon</span>
              </div>
              <div class="text-gray-500">Simulate various network error conditions</div>
            </div>
          </div>

          <div class="flex items-center gap-4 p-2 rounded-lg opacity-60">
            <div class="w-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-lg">Delay request</span>
                <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Coming soon</span>
              </div>
              <div class="text-gray-500">Add artificial delays to simulate slow network</div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )
})
