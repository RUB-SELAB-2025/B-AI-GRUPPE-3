import {spawn, ChildProcess } from "child_process"; 
import {join} from "path"; 
import { existsSync } from "fs";
import {app} from "electron"; 
import * as net from 'net';

/**
 * @description BackendManager handles the logic needed to start and stop the local OmnAI-Backend.
 * It provides a function to start and stop the backend, as well as receiving the port on which the backend currently runs. 
 * @version implements v0.5.1 of the backend interface 
 */
export const omnaiscopeBackendManager = (()=> { // singelton for only one possible encapsulated instance of the backend 
    let backendProcess : ChildProcess | null = null;
    let port : number = 0;  

    /**
     * @description Typeguard for the AddressInfo of a port
     * @param address 
     * @returns 
     */
    function isAddressInfo(address: string | net.AddressInfo | null): address is net.AddressInfo {
        return typeof address === 'object' && address !== null && typeof address.port === 'number';
    }    
    /**
     * @description gets a free port for the backend from the OS
     * @async
     * @usage should be used before starting the backend 
     * @returns 
     */
    async function getFreePort() : Promise<number>{
        return new Promise((resolve, reject) => {
            const server = net.createServer(); 
            server.unref(); //allows the programm to exit if this is the only server running 
            server.once("error", err => reject(err)); //first handle errors then listen to skip an internal error
            server.listen(0, () => { // the OS gets an available port
                const address = server.address();
                if (!isAddressInfo(address)) { // check that server.adress is from type AddressInfo
                    return reject(new Error('Error: Port either does not exist or address is not an AddressInfo.'));
                }

                const port = (address as net.AddressInfo).port;
                server.close(() => resolve(port));
            });
        });
    }
    /**
     * @description Receive the path for the OmnAIScope Backend in production and dev mode. 
     * !!! Path is hardcoded for both cases
     * @returns hardcoded path for production and dev mode in which the OmnAIScope Backend is currently saved 
     */
    function getBackendPath(): string {
        const exePath: string = app.isPackaged 
        ? join(process.resourcesPath, "MiniOmni.exe") // production mode 
        : join(__dirname, "..", "res", "omnai_BE", "MiniOmni.exe") // dev mode 

        return exePath; 
    }
    /**
     * @description Starts the local omnai backend on a free port given by the OS
     *  if the exe is available in the hardcoded path and a free port is available
     * @async
     */
    async function startBackend(): Promise<void> {
        const exePath : string = getBackendPath(); 

        port = await getFreePort(); 

        if(existsSync(exePath)){
            backendProcess = spawn(exePath, ["-w", "-p", port.toString()], {
                stdio: ['ignore', 'pipe', 'pipe'],
            });
            // read console buffer from BE because the backend does not delete the console buffer by itself
            // therefore the programm backend stops when the console buffer is full, temporary fix
            backendProcess.stdout.on('data', () => {}); 
            backendProcess.stderr.on('data', () => {});
        }
    }
    /**
     * @description Stops the omnai backend process if the process exists 
     */
    function stopBackend(): void {
        if(backendProcess) {
            backendProcess.kill(); 
            console.log("Backend process stopped");
        }
    }
    /**
     * @returns port of the omnaiscope backend if available , else 0
     */
    function getPort(): number {
        return port; 
    }

    return {
        startBackend, 
        stopBackend, 
        getPort
    }; 
})(); 