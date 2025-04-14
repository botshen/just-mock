import { ref } from 'vue'

const modelRef = ref()
function showModal() {
  modelRef.value.showModal()
}

function closeModal() {
  modelRef.value.close()
}

export function useRerouterStore() {
  return { showModal, closeModal, modelRef }
}
