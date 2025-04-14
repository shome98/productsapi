import { Connection } from "mongoose"

declare global{
    var mongoose: {
        conn: Connection | null;
        promise: Promise<Connection> | null;
    }
    namespace Express{
        interface Request{
            userId?: string;
        }
    }
}
export {}