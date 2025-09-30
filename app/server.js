import fs from 'fs';
const TLS_KEY = process.env.TLS_KEY_PATH || './tls/server.key';
const TLS_CRT = process.env.TLS_CERT_PATH || './tls/server.crt';


const app = express();
app.use(express.json());


app.get('/healthz', (req, res) => res.status(200).send('ok'));


app.get('/api/time', async (req, res) => {
try {
const { rows } = await pool.query('SELECT now() as now');
res.json({ now: rows[0].now });
} catch (e) {
res.status(500).json({ error: 'db_error', detail: String(e) });
}
});


app.get('/api/todos', async (req, res) => {
try {
const { rows } = await pool.query('SELECT id, title, done, created_at FROM app.todos ORDER BY id');
res.json(rows);
} catch (e) {
res.status(500).json({ error: 'db_error', detail: String(e) });
}
});


app.post('/api/todos', async (req, res) => {
const { title } = req.body || {};
if (!title) return res.status(400).json({ error: 'title_required' });
try {
const { rows } = await pool.query('INSERT INTO app.todos (title) VALUES ($1) RETURNING *', [title]);
res.status(201).json(rows[0]);
} catch (e) {
res.status(500).json({ error: 'db_error', detail: String(e) });
}
});


async function main() {
if (process.argv.includes('--migrate')) {
const client = await pool.connect();
try {
await client.query('BEGIN');
await migrate(client);
await client.query('COMMIT');
console.log('Migration complete');
} catch (e) {
await client.query('ROLLBACK');
throw e;
} finally {
client.release();
process.exit(0);
}
}


const options = {
key: fs.readFileSync(TLS_KEY),
cert: fs.readFileSync(TLS_CRT)
};


https.createServer(options, app).listen(PORT, HOST, () => {
console.log(`HTTPS app listening on https://${HOST}:${PORT}`);
});
}


main().catch(err => {
console.error(err);
process.exit(1);
});