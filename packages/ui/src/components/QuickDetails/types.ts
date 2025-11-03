import React from "react";

export type QuickDetailRendererMap<Item extends ItemBase> = {
  [K in Item as K['type']]: (item: K) => React.ReactNode
}

export type ItemBase = { type: string; body: Record<string, unknown> };