/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  bio: string;
  avatarUrl: string; // base64 data URL from file or fallback avatar
  createdAt: string;
  createdAtTimestamp: number;
  preferredHand: 'Right' | 'Left' | 'Both';
  skillLevel: 'Beginner' | 'Practitioner' | 'Specialist';
  accountStatus: 'Active';
}
