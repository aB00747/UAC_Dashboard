export const orderStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const paymentStatusColors = {
  unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export const deliveryStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_transit: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const documentStatusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export const activeStatusColors = {
  true: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  false: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const roleBadgeColors = {
  super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  staff: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export const stockEntryTypeColors = {
  purchase: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  sale: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  adjustment: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};
