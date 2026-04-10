<script setup>
const colorMode = useColorMode()
</script>

<template>
    <UBadge variant="soft" @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"  >
        <UIcon :name="colorMode.value === 'dark' ? 'material-symbols:dark-mode' : 'material-symbols:light-mode'" 
        class="text-2xl" />
    </UBadge>
</template>
