import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

function App() {
    const [coinId, setCoinId] = useState("bitcoin");
    const [connected, setConnected] = useState(false);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [prices, setPrices] = useState<any[]>([]);
    // Alert form state
    const [alertForm, setAlertForm] = useState({
        userId: "",
        coinId: "bitcoin",
        conditionType: "above",
        threshold: "",
        currency: "usd",
    });

    useEffect(() => {
        socket = io("http://localhost:4000");

        socket.on("connect", () => {
            setAlertForm({ ...alertForm, userId: socket.id as string });
            setConnected(true);
            fetch("http://localhost:4000/api/alerts/user/" + socket.id).then(res => res.json()).then(data => setAlerts(data));
        });
        socket.on("disconnect", () => setConnected(false));

        socket.on("price:update", (data) => {
            setPrices((prev) => {
                const filtered = prev.filter((p) => p.coinId !== data.coinId);
                return [...filtered, data];
            });
        });

        socket.on("alert:triggered", (data) => {
            alert(`ALERT TRIGGERED: ${data.coinId} is ${data.condition} ${data.threshold}, current price: ${data.price}`);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const subscribeCoin = () => {
        if (coinId) {
            socket.emit("subscribe:coin", coinId);
            alert(`Subscribed to coin: ${coinId}`);
        }
    };

    const unsubscribeCoin = (coinId: string) => {
        socket.emit("unsubscribe:coin", coinId);
        setPrices((prev) => prev.filter((p) => p.coinId !== coinId));
        alert(`Unsubscribed from coin: ${coinId}`);
    };

    // Create alert via backend
    const createAlert = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:4000/api/alerts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alertForm),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Alert created!");
                setAlerts((prev) => [...prev, data]);
            } else {
                alert(data.error || "Failed to create alert");
            }
        } catch (err) {
            alert("Error creating alert");
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h2>Crypto Alert Test</h2>
            <p>Status: <span style={{ color: connected ? 'green' : 'red' }}>{connected ? "Connected" : "Disconnected"}</span></p>

            <div style={{ marginTop: "20px" }}>
                <h3>Subscribe to Coin Price</h3>
                <select
                    value={coinId}
                    onChange={(e) => setCoinId(e.target.value)}
                    style={{ marginRight: '7px' }}
                >
                    <option value="bitcoin">Bitcoin</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="dogecoin">Dogecoin</option>
                </select>
                <button onClick={subscribeCoin}>Subscribe Coin</button>
            </div>

            <div style={{ marginTop: "20px" }}>
                <h3>Live Prices (update every 5s)</h3>
                <ul>
                    {prices.map((price) =>
                        <li key={price.coinId}>
                            {price.coinId}: ${price.price.price.toFixed(2)} (updated at {new Date(price.price.lastUpdated).toLocaleTimeString()})
                            <button onClick={() => unsubscribeCoin(price.coinId)} style={{ marginLeft: '18px' }}>Unsubscribe</button>
                        </li>
                    )}
                </ul>
            </div>

            <div style={{ marginTop: "20px" }}>
                <h3>Create Alert</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: '5px', maxWidth: "300px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <input
                            type="text"
                            placeholder="User ID"
                            value={alertForm.userId}
                            onChange={(e) => setAlertForm({ ...alertForm, userId: e.target.value })}
                            required
                        />
                        <small style={{ lineHeight: 1, fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', marginTop: '2px' }}>used socket io id as userid for testing it can be replaced with userid when auth is added</small>
                    </div>
                    <input
                        type="text"
                        placeholder="Coin ID"
                        value={alertForm.coinId}
                        onChange={(e) => setAlertForm({ ...alertForm, coinId: e.target.value })}
                        required
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                        <select
                            value={alertForm.conditionType}
                            onChange={(e) => setAlertForm({ ...alertForm, conditionType: e.target.value })}
                        >
                            <option value="above">Above</option>
                            <option value="below">Below</option>
                            <option value="percent_up">Percent Up</option>
                            <option value="percent_down">Percent Down</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Threshold"
                            value={alertForm.threshold}
                            onChange={(e) => setAlertForm({ ...alertForm, threshold: e.target.value })}
                            required
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Currency"
                        value={alertForm.currency}
                        onChange={(e) => setAlertForm({ ...alertForm, currency: e.target.value })}
                    />
                    <button onClick={createAlert}>Create Alert</button>
                </div>
            </div>

            <div style={{ marginTop: "20px" }}>
                <h3>Alerts</h3>
                <ul>
                    {alerts.map((alert, i) => <li key={i}> {alert.coinId} {alert.conditionType} {alert.threshold} </li>)}
                </ul>
            </div>
        </div>
    );
}

export default App;
