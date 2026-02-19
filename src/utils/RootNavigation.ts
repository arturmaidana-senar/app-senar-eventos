import { NavigationContainerRef } from '@react-navigation/native';
import React from 'react';

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export function clientNavigate(name: string) {
  navigationRef.current?.navigate(name);
}
