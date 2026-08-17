import React from 'react';
import { ScrollView, View } from 'react-native';
import { COLUMN, space } from '@/theme';

/** A panel of the pager: scrolls vertically, holds its content to one column. */
export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: space.xxxl * 2, alignItems: 'center' }}
      showsVerticalScrollIndicator={false}
      {...({ dataSet: { willoScroll: true } } as any)}
    >
      <View style={{ width: '100%', maxWidth: COLUMN, paddingHorizontal: space.xl, gap: space.xxl }}>
        {children}
      </View>
    </ScrollView>
  );
}
