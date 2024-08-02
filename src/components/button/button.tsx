import { themes } from '@/constants/Colors'
import React from 'react'
import type { ButtonProps } from 'tamagui'
import {Button as TamaguiBtn} from "tamagui"

const Button = (props:ButtonProps) => {
  return (
    <TamaguiBtn bg="$primary" color="$primaryForeground"  pressStyle={{opacity: 0.8}} {...props} /> 
  )
}

export  {Button}