"use client"

import { Toaster as ChakraToaster, Portal, Text, Box } from "@chakra-ui/react"
import { toaster } from "@/lib/toaster"

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ md: "16" }}>
        {(toast) => (
          <Box p="4" bg="white" color="black" shadow="md" borderRadius="md" border="1px solid" borderColor="slate.200">
            <Text fontWeight="bold">{toast.title}</Text>
            {toast.description && <Text fontSize="sm">{toast.description}</Text>}
          </Box>
        )}
      </ChakraToaster>
    </Portal>
  )
}
