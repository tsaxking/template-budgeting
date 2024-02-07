import { backToMain } from '../manager.ts';
import Role from '../../server/structure/roles.ts';
import { selectAccount } from './accounts.ts';
import { confirm, repeatPrompt, select } from '../prompt.ts';
import { attemptAsync, Result } from '../../shared/';
import { addPermissions, removePermissions } from './permissions.ts';

export const selectRole = async (
    message = 'Select a role',
): Promise<Result<Role>> => {
    return attemptAsync(async () => {
        const roles = await Role.all();
        if (!roles.length) {
            throw new Error('no-role');
        }

        return await select<Role>(
            message,
            roles.map((role) => ({
                name: role.name,
                value: role,
            })),
        );
    });
};

export const createRole = async () => {
    const name = repeatPrompt(
        'Enter the new role name',
        undefined,
        (data) => !Role.fromName(data),
        false,
    );
    const description = repeatPrompt('Enter the role description');
    const rank = +repeatPrompt(
        'Enter the role rank',
        undefined,
        (data) => !isNaN(parseInt(data)),
        false,
    );

    Role.new(name, description, rank);

    backToMain(`Role ${name} created`);
};

export const deleteRole = async () => {
    const res = await selectRole();
    if (res.isOk()) {
        if (!res.value) {
            return backToMain(
                'Failure to find role (this is a bug, please report)',
            );
        }

        const isGood = await confirm(
            `Are you sure you want to delete the role ${res.value.name}?`,
        );

        if (isGood) {
            res.value.delete();
            backToMain(`Role ${res.value.name} deleted`);
        } else {
            backToMain('Role not deleted');
        }
    } else {
        backToMain('No roles to delete');
    }
};

export const addRoleToAccount = async () => {
    const roleRes = await selectRole();

    if (roleRes.isOk()) {
        const accountRes = await selectAccount();
        if (accountRes.isOk()) {
            const account = accountRes.value;
            const role = roleRes.value;

            const roles = await account.getRoles();

            if (roles.some((r) => r.name === role.name)) {
                backToMain(
                    `Account ${account.username} already has role ${role.name}`,
                );
            } else {
                account.addRole(role);
                backToMain(
                    `Role ${role.name} added to account ${account.username}`,
                );
            }
        }
    } else {
        backToMain('No roles to add');
    }
};

export const removeRoleFromAccount = async () => {
    const accountRes = await selectAccount();

    if (accountRes.isOk()) {
        const account = accountRes.value;
        const roles = await account.getRoles();
        if (!roles.length) {
            backToMain(`Account ${account.username} has no roles`);
        } else {
            const role = await select<Role>(
                'Select a role to remove',
                roles.map((r) => ({
                    name: r.name,
                    value: r,
                })),
            );

            if (role) {
                account.removeRole(role);
                backToMain(
                    `Role ${role.name} removed from account ${account.username}`,
                );
            } else {
                backToMain('No roles to remove');
            }
        }
    } else {
        backToMain('No accounts to remove roles from');
    }
};

export const roles = [
    {
        icon: '📝',
        value: createRole,
    },
    {
        icon: '🗑️',
        value: deleteRole,
    },
    {
        icon: '➕',
        value: addRoleToAccount,
    },
    {
        icon: '➖',
        value: removeRoleFromAccount,
    },
    {
        icon: '🔒',
        value: addPermissions,
    },
    {
        icon: '🔓',
        value: removePermissions,
    },
];
