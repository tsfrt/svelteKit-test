import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import * as Bindings from '@nebhale/service-bindings';
import * as oracledb from 'oracledb';

export const load = (({ }) => {
    const bindingName = process.env.DB_SERVICE_BINDING_NAME || "oracle-binding";

    async function connectionInfo() {
        console.log("using @nebhale/service-bindings");
        let connection;
        let b = await Bindings.fromServiceBindingRoot();
        let ob = await Bindings.find(b, bindingName);
        console.log(ob);
        if (ob == undefined) {
            return `No bindings found`;
        }
        const user = await Bindings.get(ob, 'username');
        console.log("user" + user);
        const dbConfig = {
            user: await Bindings.get(ob, 'username'),
            password: await Bindings.get(ob, 'password'),
            connectString: await Bindings.get(ob, 'connectionString'),
            externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false,
        };

        console.log(dbConfig);
        try {
            // Get a non-pooled connection
            connection = await oracledb.getConnection(dbConfig);

            console.log('Connection was successful!');
            const result = await connection.execute(
                `SELECT UNIQUE CLIENT_DRIVER
				 FROM V$SESSION_CONNECT_INFO
				 WHERE SID = SYS_CONTEXT('USERENV', 'SID')`);
            console.log("CLIENT_DRIVER                 :", result.rows[0][0].replace(': ', ''));
            return JSON.stringify(result, undefined, 4);
        } catch (err) {
            console.error(err);
            return "Error connecting to DB";
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    return {
        bindingName: bindingName,
        connectionInfo: connectionInfo()
    };
}) satisfies PageServerLoad;