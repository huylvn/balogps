// Server-Sent Events service for real-time updates
const clients = new Map(); // child_id -> Set of response objects

function addClient(child_id, res) {
  if (!clients.has(child_id)) {
    clients.set(child_id, new Set());
  }
  clients.get(child_id).add(res);
  
  console.log(`SSE client added for child ${child_id}. Total clients: ${clients.get(child_id).size}`);
}

function removeClient(child_id, res) {
  if (clients.has(child_id)) {
    clients.get(child_id).delete(res);
    if (clients.get(child_id).size === 0) {
      clients.delete(child_id);
    }
    console.log(`SSE client removed for child ${child_id}`);
  }
}

function sendEvent(child_id, event) {
  if (!clients.has(child_id)) {
    return;
  }
  
  const eventData = `data: ${JSON.stringify(event)}\n\n`;
  
  for (const res of clients.get(child_id)) {
    try {
      res.write(eventData);
    } catch (error) {
      console.error('Error sending SSE event:', error);
      removeClient(child_id, res);
    }
  }
}

function handleSSEConnection(req, res) {
  const { child_id } = req.params;
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', child_id })}\n\n`);
  
  // Add client
  addClient(child_id, res);
  
  // Remove client on connection close
  req.on('close', () => {
    removeClient(child_id, res);
  });
}

module.exports = {
  addClient,
  removeClient,
  sendEvent,
  handleSSEConnection,
};
