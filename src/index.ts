import {
	Telegraf,
	Stage,
	session
} from "telegraf";
import { SceneManager } from "./SceneManager";

const token = process.env.BOT_TOKEN;
if (token === undefined) {
	throw new Error('BOT_TOKEN must be provided!')
}
console.log("token using:", token);

const bot = new Telegraf(token);
const patternScene = new SceneManager();
const startScene = patternScene.startScene();
const adminPanel = patternScene.adminPanel();
const stage = new Stage([startScene, adminPanel]);

bot.use(session());
bot.use(stage.middleware());
bot.command("start",ctx => {
	// @ts-ignore
	ctx.scene.enter("startbot")
});
bot.launch();