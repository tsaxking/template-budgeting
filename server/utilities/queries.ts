// This file was generated by a script, please do not modify it. If you see any problems, please raise an issue on  https://github.com/tsaxking/webpack-template/issues

import { Accounts } from './tables';
import { Members } from './tables';
import { Roles } from './tables';
import { AccountRoles } from './tables';
import { Permissions } from './tables';
import { Version } from './tables';
import { Sessions } from './tables';
import { Blacklist } from './tables';
import { AccountSettings } from './tables';
import { Select_permissions_all } from './tables';
import { Select_roles_from_name } from './tables';
import { Delete_roles_delete } from './tables';
import { Update_roles_update } from './tables';
import { Insert_roles_new } from './tables';
import { Select_roles_from_id } from './tables';
import { Select_roles_all } from './tables';
import { Delete_sessions_delete } from './tables';
import { Delete_sessions_delete_all } from './tables';
import { Update_sessions_update } from './tables';
import { Insert_sessions_new } from './tables';
import { Select_sessions_get } from './tables';
import { Select_sessions_all } from './tables';
import { Delete_member_delete } from './tables';
import { Update_member_update_title } from './tables';
import { Update_member_update_status } from './tables';
import { Update_member_update_resume } from './tables';
import { Update_member_remove_from_board } from './tables';
import { Insert_member_new } from './tables';
import { Update_member_update_bio } from './tables';
import { Update_member_add_to_board } from './tables';
import { Select_member_all } from './tables';
import { Update_account_unverify } from './tables';
import { Update_account_set_verification } from './tables';
import { Delete_account_delete } from './tables';
import { Select_account_unverified } from './tables';
import { Update_account_change_password } from './tables';
import { Insert_account_save_settings } from './tables';
import { Select_account_from_username } from './tables';
import { Update_account_update_picture } from './tables';
import { Select_account_from_verification_key } from './tables';
import { Select_account_verified } from './tables';
import { Update_account_verify } from './tables';
import { Select_account_get_settings } from './tables';
import { Update_account_change_email } from './tables';
import { Delete_account_remove_role } from './tables';
import { Insert_account_add_role } from './tables';
import { Select_account_from_email } from './tables';
import { Insert_account_new } from './tables';
import { Update_account_request_password_change } from './tables';
import { Select_account_from_password_change } from './tables';
import { Select_account_from_id } from './tables';
import { Select_account_all } from './tables';
import { Update_account_request_email_change } from './tables';
import { Update_account_change_username } from './tables';
import { Select_db_get_version } from './tables';
import { Update_db_change_version } from './tables';
import { Insert_db_init } from './tables';
import { RolePermissions } from './tables';
import { Insert_permissions_add_to_role } from './tables';
import { Delete_permissions_remove_from_role } from './tables';
import { Select_blacklist_all } from './tables';
import { Update_sessions_sign_in } from './tables';
import { Update_sessions_sign_out } from './tables';
import { Insert_db_change_version } from './tables';
import { Delete_db_delete_version } from './tables';
import { Transactions } from './tables';
import { Buckets } from './tables';
import { BalanceCorrection } from './tables';
import { Miles } from './tables';
import { Subscriptions } from './tables';
import { TransactionTypes } from './tables';
import { Subtypes } from './tables';
import { Select_balance_correction_all } from './tables';
import { Insert_balance_correction_new } from './tables';
import { Update_balance_correction_update } from './tables';
import { Select_buckets_all } from './tables';
import { Select_buckets_archived } from './tables';
import { Insert_buckets_new } from './tables';
import { Update_buckets_set_archive } from './tables';
import { Update_buckets_update } from './tables';
import { Select_miles_active } from './tables';
import { Select_miles_archived } from './tables';
import { Select_miles_from_id } from './tables';
import { Insert_miles_new } from './tables';
import { Update_miles_set_archive } from './tables';
import { Update_miles_update } from './tables';
import { Select_subscriptions_active } from './tables';
import { Select_subscriptions_archived } from './tables';
import { Select_subscriptions_from_bucket } from './tables';
import { Select_subscriptions_from_id } from './tables';
import { Insert_subscriptions_new } from './tables';
import { Update_subscriptions_set_archive } from './tables';
import { Update_subscriptions_update } from './tables';
import { Select_transactions_archived } from './tables';
import { Select_transactions_between } from './tables';
import { Select_transactions_deposits } from './tables';
import { Select_transactions_from_bucket } from './tables';
import { Select_transactions_from_id } from './tables';
import { Select_transactions_from_status } from './tables';
import { Select_transactions_from_subtype } from './tables';
import { Select_transactions_from_tax_deductible } from './tables';
import { Insert_transactions_new } from './tables';
import { Update_transactions_set_archive } from './tables';
import { Update_transactions_update_picture } from './tables';
import { Update_transactions_update } from './tables';
import { Select_transactions_withdrawals } from './tables';
import { Select_types_all_subtypes } from './tables';
import { Select_types_all_types } from './tables';
import { Insert_types_new_subtype } from './tables';
import { Insert_types_new_type } from './tables';
import { Select_types_subtype_from_type } from './tables';
import { Update_types_update_subtype } from './tables';
import { Update_types_update_type } from './tables';
import { Delete_balance_correction_delete } from './tables';
import { Select_balance_correction_from_id } from './tables';
import { Budgets } from './tables';
import { BudgetSubtypes } from './tables';
import { Goals } from './tables';
import { BudgetParsing } from './tables';
import { Select_budgets_budget_from_id } from './tables';
import { Select_budgets_budget_subtypes_from_budget } from './tables';
import { Delete_budgets_delete_budget_subtype } from './tables';
import { Delete_budgets_delete_budget } from './tables';
import { Insert_budgets_new_budget_subtype } from './tables';
import { Insert_budgets_new_budget } from './tables';
import { Update_budgets_update_budget } from './tables';
import { Update_db_versions______ } from './tables';
import { Select_loans_all } from './tables';
import { Select_transactions_all } from './tables';
import { Select_types_type_from_id } from './tables';
import { BucketGoals } from './tables';
import { TransactionGoals } from './tables';
import { Select_budgets_all } from './tables';
import { Select_goals_all } from './tables';
import { Select_goals_from_id } from './tables';
import { Select_goals_get_bucket_goals } from './tables';
import { Select_goals_get_transaction_goals } from './tables';
import { Insert_goals_new_bucket_goals } from './tables';
import { Insert_goals_new_transaction_goal } from './tables';
import { Insert_goals_new } from './tables';
import { Delete_goals_remove_bucket_goals } from './tables';
import { Delete_goals_remove_transaction_goal } from './tables';
import { Update_goals_update } from './tables';
import { Select_types_subtype_from_id } from './tables';

export type Queries = {
    'permissions/all': [[Select_permissions_all], Permissions];
    'permissions/from-role': [[{ roleId: string }], Permissions];
    'permissions/remove-from-role': [
        [Delete_permissions_remove_from_role],
        unknown
    ];
    'permissions/add-to-role': [[Insert_permissions_add_to_role], unknown];
    'roles/from-name': [[Select_roles_from_name], Roles];
    'roles/delete': [[Delete_roles_delete], unknown];
    'roles/update': [[Update_roles_update], unknown];
    'roles/new': [[Insert_roles_new], unknown];
    'roles/from-id': [[Select_roles_from_id], Roles];
    'roles/all': [[Select_roles_all], Roles];
    'roles/from-username': [[{ username: string }], Roles];
    'sessions/delete': [[Delete_sessions_delete], unknown];
    'sessions/delete-all': [[Delete_sessions_delete_all], unknown];
    'sessions/update': [[Update_sessions_update], unknown];
    'sessions/new': [[Insert_sessions_new], unknown];
    'sessions/get': [[Select_sessions_get], Sessions];
    'sessions/all': [[Select_sessions_all], Sessions];
    'sessions/sign-in': [[Update_sessions_sign_in], unknown];
    'sessions/sign-out': [[Update_sessions_sign_out], unknown];
    'member/delete': [[Delete_member_delete], unknown];
    'member/update-title': [[Update_member_update_title], unknown];
    'member/update-status': [[Update_member_update_status], unknown];
    'member/update-resume': [[Update_member_update_resume], unknown];
    'member/remove-from-board': [[Update_member_remove_from_board], unknown];
    'member/new': [[Insert_member_new], unknown];
    'member/update-bio': [[Update_member_update_bio], unknown];
    'member/add-to-board': [[Update_member_add_to_board], unknown];
    'member/all': [[Select_member_all], Members];
    'member/from-username': [[{ username: string }], Members];
    'account/unverify': [[Update_account_unverify], unknown];
    'account/set-verification': [[Update_account_set_verification], unknown];
    'account/delete': [[Delete_account_delete], unknown];
    'account/unverified': [[Select_account_unverified], Accounts];
    'account/change-password': [[Update_account_change_password], unknown];
    'account/save-settings': [[Insert_account_save_settings], unknown];
    'account/from-username': [[Select_account_from_username], Accounts];
    'account/update-picture': [[Update_account_update_picture], unknown];
    'account/from-verification-key': [
        [Select_account_from_verification_key],
        Accounts
    ];
    'account/verified': [[Select_account_verified], Accounts];
    'account/verify': [[Update_account_verify], unknown];
    'account/get-settings': [[Select_account_get_settings], AccountSettings];
    'account/change-email': [[Update_account_change_email], unknown];
    'account/remove-role': [[Delete_account_remove_role], unknown];
    'account/add-role': [[Insert_account_add_role], unknown];
    'account/from-email': [[Select_account_from_email], Accounts];
    'account/new': [[Insert_account_new], unknown];
    'account/request-password-change': [
        [Update_account_request_password_change],
        unknown
    ];
    'account/from-password-change': [
        [Select_account_from_password_change],
        Accounts
    ];
    'account/from-id': [[Select_account_from_id], Accounts];
    'account/all': [[Select_account_all], Accounts];
    'account/request-email-change': [
        [Update_account_request_email_change],
        unknown
    ];
    'account/change-username': [[Update_account_change_username], unknown];
    'account/roles': [[{ id: string }], Roles];
    'db/get-version': [[Select_db_get_version], Version];
    'db/change-version': [[Insert_db_change_version], unknown];
    'db/delete-version': [[Delete_db_delete_version], unknown];
    'db/init': [[Insert_db_init], unknown];
    'blacklist/all': [[Select_blacklist_all], Blacklist];
    'blacklist/new': [
        [
            {
                id: string;
                ip: string;
                created: number;
                accountId: string | undefined;
                reason: string;
            }
        ],
        unknown
    ];
    'blacklist/delete': [[{ id: string }], unknown];
    'blacklist/from-account': [[{ accountId: string }], Blacklist];
    'blacklist/from-ip': [[{ ip: string }], Blacklist];
    'blacklist/delete-by-ip': [[{ ip: string }]];
    'blacklist/delete-by-account': [[{ accountId: string }]];
    'balance-correction/all': [
        [Select_balance_correction_all],
        BalanceCorrection
    ];
    'balance-correction/new': [[Insert_balance_correction_new], unknown];
    'balance-correction/update': [[Update_balance_correction_update], unknown];
    'buckets/all': [[Select_buckets_all], Buckets];
    'buckets/archived': [[Select_buckets_archived], Buckets];
    'buckets/new': [[Insert_buckets_new], unknown];
    'buckets/set-archive': [[Update_buckets_set_archive], unknown];
    'buckets/update': [[Update_buckets_update], unknown];
    'buckets/from-id': [[{ id: string }], Buckets];
    'miles/active': [[Select_miles_active], Miles];
    'miles/archived': [[Select_miles_archived], Miles];
    'miles/from-id': [[Select_miles_from_id], Miles];
    'miles/new': [[Insert_miles_new], unknown];
    'miles/set-archive': [[Update_miles_set_archive], unknown];
    'miles/update': [[Update_miles_update], unknown];
    'subscriptions/active': [[Select_subscriptions_active], Subscriptions];
    'subscriptions/archived': [[Select_subscriptions_archived], Subscriptions];
    'subscriptions/from-bucket': [
        [Select_subscriptions_from_bucket],
        Subscriptions
    ];
    'subscriptions/from-id': [[Select_subscriptions_from_id], Subscriptions];
    'subscriptions/new': [[Insert_subscriptions_new], unknown];
    'subscriptions/set-archive': [[Update_subscriptions_set_archive], unknown];
    'subscriptions/update': [[Update_subscriptions_update], unknown];
    'transactions/archived': [[Select_transactions_archived], Transactions];
    'transactions/between': [[Select_transactions_between], Transactions];
    'transactions/deposits': [[Select_transactions_deposits], Transactions];
    'transactions/from-bucket': [
        [Select_transactions_from_bucket],
        Transactions
    ];
    'transactions/from-id': [[Select_transactions_from_id], Transactions];
    'transactions/from-status': [
        [Select_transactions_from_status],
        Transactions
    ];
    'transactions/from-subtype': [
        [Select_transactions_from_subtype],
        Transactions
    ];
    'transactions/from-tax-deductible': [
        [Select_transactions_from_tax_deductible],
        Transactions
    ];
    'transactions/new': [[Insert_transactions_new], unknown];
    'transactions/set-archive': [[Update_transactions_set_archive], unknown];
    'transactions/update-picture': [
        [Update_transactions_update_picture],
        unknown
    ];
    'transactions/update': [[Update_transactions_update], unknown];
    'transactions/withdrawals': [
        [Select_transactions_withdrawals],
        Transactions
    ];
    'transactions/all': [[], Transactions];
    'transactions/from-type': [[{ typeId: string }], Transactions];
    'types/all-subtypes': [[Select_types_all_subtypes], Subtypes];
    'types/all-types': [[Select_types_all_types], TransactionTypes];
    'types/new-subtype': [[Insert_types_new_subtype], unknown];
    'types/new-type': [[Insert_types_new_type], unknown];
    'types/subtype-from-type': [[Select_types_subtype_from_type], Subtypes];
    'types/update-subtype': [[Update_types_update_subtype], unknown];
    'types/update-type': [[Update_types_update_type], unknown];
    'types/type-from-id': [[{ id: string }], TransactionTypes];
    'types/subtype-from-id': [[{ id: string }], Subtypes];
    'balance-correction/delete': [[Delete_balance_correction_delete], unknown];
    'balance-correction/from-id': [
        [Select_balance_correction_from_id],
        BalanceCorrection
    ];
    'budgets/budget-from-id': [[Select_budgets_budget_from_id], Budgets];
    'budgets/budget-subtypes-from-budget': [
        [Select_budgets_budget_subtypes_from_budget],
        Subtypes
    ];
    'budgets/delete-budget-subtype': [
        [Delete_budgets_delete_budget_subtype],
        unknown
    ];
    'budgets/delete-budget': [[Delete_budgets_delete_budget], unknown];
    'budgets/new-budget-subtype': [
        [Insert_budgets_new_budget_subtype],
        unknown
    ];
    'budgets/new-budget': [[Insert_budgets_new_budget], unknown];
    'budgets/update-budget': [[Update_budgets_update_budget], unknown];
    'budgets/all': [[], Budgets];
    'db/versions/1-4-5': [[Update_db_versions______], unknown];
    'loans/all': [[]];
    'goals/all': [[Select_goals_all], Goals];
    'goals/from-id': [[Select_goals_from_id], Goals];
    'goals/get-bucket-goals': [[Select_goals_get_bucket_goals], Buckets];
    'goals/get-transaction-goals': [
        [Select_goals_get_transaction_goals],
        Transactions
    ];
    'goals/new-bucket-goals': [[Insert_goals_new_bucket_goals], unknown];
    'goals/new-transaction-goal': [
        [Insert_goals_new_transaction_goal],
        unknown
    ];
    'goals/new': [[Insert_goals_new], unknown];
    'goals/remove-bucket-goals': [[Delete_goals_remove_bucket_goals], unknown];
    'goals/remove-transaction-goal': [
        [Delete_goals_remove_transaction_goal],
        unknown
    ];
    'goals/update': [[Update_goals_update], unknown];
};
