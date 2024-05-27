export enum Category {
  Clothing = 'Clothing',
  Entertainment = 'Entertainment',
  Food = 'Food',
  GiftDonation = 'GiftDonation',
  HealthPersonalCare = 'HealthPersonalCare',
  HouseholdSupply = 'HouseholdSupply',
  Housing = 'Housing',
  Personal = 'Personal',
  Transportation = 'Transportation',
  Utilities = 'Utilities'
}

export const categoryDetails = {
  [Category.Clothing]: {
    icon: 'mdi-tshirt-crew',
    color: 'blue' // Primary blue for clothing
  },
  [Category.Entertainment]: {
    icon: 'mdi-movie-open',
    color: 'teal' // Teal for entertainment
  },
  [Category.Food]: {
    icon: 'mdi-food',
    color: 'green' // Primary green for food
  },
  [Category.GiftDonation]: {
    icon: 'mdi-gift',
    color: 'lime' // Primary red for gifts and donations
  },
  [Category.HealthPersonalCare]: {
    icon: 'mdi-hospital-box',
    color: 'light-blue' // Light blue for health and personal care
  },
  [Category.HouseholdSupply]: {
    icon: 'mdi-home-outline',
    color: 'brown' // Brown for household supplies
  },
  [Category.Housing]: {
    icon: 'mdi-home-city',
    color: 'blue-grey' // Blue-grey for housing expenses
  },
  [Category.Personal]: {
    icon: 'mdi-account',
    color: 'purple' // Primary purple for personal expenses
  },
  [Category.Transportation]: {
    icon: 'mdi-bus',
    color: 'amber' // Amber for transportation
  },
  [Category.Utilities]: {
    icon: 'mdi-flash',
    color: 'deep-orange' // Deep orange for utilities
  }
}
