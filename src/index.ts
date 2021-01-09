import {
	Telegraf,
	Stage,
	session
} from "telegraf";
import { SceneManager } from "./SceneManager";
import { db }  from "./DateBase";

const token = process.env.BOT_TOKEN;
if (token === undefined) {
	throw new Error('BOT_TOKEN must be provided!')
}
console.log("token using:", token);

const bot = new Telegraf(token);
const patternScene = new SceneManager();
const startScene = patternScene.startScene();
const adminPanel = patternScene.adminPanel();
const addProduct = patternScene.addProduct();
const goToBasket = patternScene.goToBasket();
const stage = new Stage([startScene, adminPanel, addProduct, goToBasket]);

bot.use(session());
bot.use(stage.middleware());
bot.command("start",ctx => {
	// @ts-ignore
	ctx.scene.enter("startbot");
});

bot.action("addToBasket", async ctx => {
	let name_product = ctx.callbackQuery.message.text.split('\n')[0].replace("Название: ", "");
	let price_product = ctx.callbackQuery.message.text.split('\n')[1].replace("Цена: ", "");
	db.adder("basket", ctx.from.username, name_product, price_product);
})
bot.action("clearBasket", async ctx => {
	db.clearBasket(ctx.from.username);
	ctx.editMessageText("Корзина очищена")
	// @ts-ignore
	ctx.scene.leave();
})
bot.action("goToBasket", async ctx => {
	// @ts-ignore
	ctx.scene.enter("goToBasket");
})
bot.launch();