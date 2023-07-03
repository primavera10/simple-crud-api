import http from 'node:http';
import { v4 as uuidv4, validate } from 'uuid';
import 'dotenv/config'

const host = 'localhost';
const port = process.env.PORT;

const users = [];


const myServer = function (req, res) {
    try {
        const regex = /\/api\/users\/([a-zA-Z0-9-]+)/;
        const match = req.url.match(regex);
        if (req.url === '/api/users' && req.method === 'GET') {
            res.writeHead(200, {
                'Content-Type': 'application/json',
            })
            return res.end(JSON.stringify(users))
        } else if (match && req.method === 'GET') {
            const id = match[1];
            if (!validate(id)) {
                res.writeHead(400);
                return res.end('Invalid uuid');
            }

            const user = users.find(u => u.id === id);
            if (!user) {
                res.writeHead(404);
                return res.end('User not found');
            }

            res.writeHead(200, {
                'Content-Type': 'application/json',
            });
            return res.end(JSON.stringify(user));
        } else if (req.url === '/api/users' && req.method === 'POST') {
            const data = [];
            req.on('data', (chunk) => {
                data.push(chunk)
            });
            req.on('end', () => {
                const payload = JSON.parse(data.join(''));
                if (
                    typeof payload.username !== 'string'
                    || typeof payload.age !== 'number'
                    || !Array.isArray(payload.hobbies)
                ) {
                    res.writeHead(400)
                    return res.end('Request body doest not contain required fields')
                }
                if (
                    payload.hobbies.length > 0 && !payload.hobbies.every(hobby => typeof hobby === 'string')
                ) {
                    res.writeHead(400)
                    return res.end('Request body doest not contain required fields')
                }
                const user = {
                    ...payload,
                    id: uuidv4(),
                };
                users.push(user);
                res.writeHead(201, {
                    'Content-Type': 'application/json'
                })
                return res.end(JSON.stringify(user))
            })
        } else if (match && req.method === 'PUT') {
            const data = []
            req.on('data', (chunk) => {
                data.push(chunk)
            });
            req.on('end', () => {
                const payload = JSON.parse(data.join(''));
                if (
                    typeof payload.username !== 'string'
                    || typeof payload.age !== 'number'
                    || !Array.isArray(payload.hobbies)
                ) {
                    res.writeHead(400)
                    return res.end('Request body doest not contain required fields')
                }
                if (
                    payload.hobbies.length > 0 && !payload.hobbies.every(hobby => typeof hobby === 'string')
                ) {
                    res.writeHead(400)
                    return res.end('Request body doest not contain required fields')
                }
                const id = match[1];
                if (!validate(id)) {
                    res.writeHead(400);
                    return res.end('Invalid uuid');
                }
                const userIndex = users.findIndex(u => u.id === id)
                const selectedUser = users[userIndex];
                if (!selectedUser) {
                    res.writeHead(404);
                    return res.end('User not found');
                }
                const userId = selectedUser.id
                const user = {
                    ...payload,
                    id: userId
                }
                users[userIndex] = user;
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                })
                return res.end(JSON.stringify(user))
            })
        } else if (req.method === 'DELETE' && match) {
            const id = match[1]
            if (!validate(id)) {
                res.writeHead(400);
                return res.end('Invalid uuid');
            }
            const userIndex = users.findIndex(u => u.id === id)
            const user = users[userIndex]
            if (!user) {
                res.writeHead(404);
                return res.end('User not found');
            }
            users.splice(userIndex)
            res.writeHead(204)
            return res.end('User found and deleted!')
        } else {
            res.writeHead(404)
            return res.end('Invalid endpoint!')
        }
    } catch (e) {
        res.writeHead(500)
        return res.end('Server side error')
    }
}
const server = http.createServer(myServer)

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

