/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WireType {
  id: string;
  pin: number; // Correct pin position in T568B
  pinA: number; // Correct pin position in T568A
  label: string;
  striped: boolean;
  color: string;
  role: string; // e.g. TX+, RX-, Bi+
  roleDescription: string;
  roleClass: 'role-tx' | 'role-rx' | 'role-poe';
  shortRole: string;
  pairName: string;
  detail: string;
}

export interface PairType {
  name: string;
  color: string;
  pinsB: number[];
  pinsA: number[];
  funcIcon: string;
  funcTitle: string;
  funcDesc: string;
  detailedTech: string; // Detailed explaining TX/RX/Gigabit/PoE
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type CableStandard = 'T568B' | 'T568A';
