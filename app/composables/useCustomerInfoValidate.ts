import { computed, type Ref } from 'vue'
import type { CustomerInfo } from "~/types"

export const useCustomerInfoValidate = (customerInfo: Ref<CustomerInfo>) => {
  
  // 1. ตรวจสอบชื่อ: ต้องไม่ว่าง, ไม่เกิน 32 ตัวอักษร และ "ห้ามมีตัวเลข"
  const isNameValid = computed(() => {
    const name = customerInfo.value.name.trim()
    // Regex: ^[^0-9]*$ หมายถึง ตั้งแต่เริ่มจนจบห้ามมีเลข 0-9
    const noNumbersRegex = /^[^0-9]*$/
    return (
      name.length > 0 && 
      name.length <= 32 && 
      noNumbersRegex.test(name)
    )
  })

  // 2. ตรวจสอบเบอร์โทร: ต้องเป็นตัวเลขเท่านั้น และมี 10 หลัก (ขึ้นต้นด้วย 0)
  const isPhoneValid = computed(() => {
    const phone = customerInfo.value.phone.trim()
    // Regex: ^0\d{9}$ หมายถึง ขึ้นต้นด้วย 0 ตามด้วยตัวเลข (\d) อีก 9 ตัว รวมเป็น 10
    const onlyNumbersRegex = /^0\d{9}$/
    return onlyNumbersRegex.test(phone)
  })

  // 3. ตรวจสอบที่อยู่: ขั้นต่ำ 10 ตัวอักษร
  const isAddressValid = computed(() => {
    return customerInfo.value.address.trim().length >= 6
  })

  const isFormValid = computed(() => {
    return isNameValid.value && isPhoneValid.value && isAddressValid.value
  })

  const errors = computed(() => {
    return {
      name: isNameValid.value ? '' : 'ชื่อต้องไม่มีตัวเลข และยาวไม่เกิน 32 ตัวอักษร',
      phone: isPhoneValid.value ? '' : 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก (เช่น 0812345678)',
      address: isAddressValid.value ? '' : 'กรุณากรอกที่อยู่ให้ชัดเจน (อย่างน้อย 6 ตัวอักษร)',
    }
  })

  return {
    isNameValid,
    isPhoneValid,
    isAddressValid,
    isFormValid,
    errors
  }
}