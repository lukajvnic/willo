import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { type as t } from '@/theme';

type Variant = keyof typeof t;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Txt({ variant = 'body', color, style, ...rest }: Props) {
  return <Text {...rest} style={[t[variant] as TextStyle, color ? { color } : null, style]} />;
}

/** Small uppercase mono label. Used for section eyebrows and units. */
export const Micro = (props: Props) => <Txt variant="micro" {...props} />;
