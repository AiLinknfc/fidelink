import type { ComponentType } from 'react';
import type { CardModelProps } from './types';

const REGISTRY = new Map<string, ComponentType<CardModelProps>>();

export function registerCardModel(tag: string, Component: ComponentType<CardModelProps>) {
  REGISTRY.set(tag, Component);
}

export function getCardComponent(tag: string): ComponentType<CardModelProps> | undefined {
  return REGISTRY.get(tag);
}

export function hasCardComponent(tag: string): boolean {
  return REGISTRY.has(tag);
}

// Direct registry population — no circular deps since components only import types
import EventTicketCard from './EventTicketCard';
import VIPGoldCard from './VIPGoldCard';
import PremiumGiftCard from './PremiumGiftCard';
import BoardingPassCard from './BoardingPassCard';
import EventBadgeCard from './EventBadgeCard';
import StaffCard from './StaffCard';
import CreditStyleCard from './CreditStyleCard';

registerCardModel('EventTicket', EventTicketCard);
registerCardModel('VIPGold', VIPGoldCard);
registerCardModel('PremiumGift', PremiumGiftCard);
registerCardModel('BoardingPass', BoardingPassCard);
registerCardModel('EventBadge', EventBadgeCard);
registerCardModel('StaffCard', StaffCard);
registerCardModel('CreditCashback', CreditStyleCard);
registerCardModel('CreditBenefits', CreditStyleCard);
registerCardModel('CreditRewards', CreditStyleCard);
registerCardModel('CreditAccess', CreditStyleCard);
registerCardModel('CreditPremium', CreditStyleCard);
