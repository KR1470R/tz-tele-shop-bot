import { Markup, BaseScene} from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import DateBase from "./DateBase";
const admin_id : string = process.env.TG_ADMIN_ID;

export class SceneManager {
	public startScene() {
		const start = new BaseScene("startbot");
		start.enter(async (ctx : TelegrafContext) => {
			let buttons = [];
			if (ctx.from.username === admin_id) buttons = buttons.concat(["Admin panel"]);
			const db = new DateBase();
			let products = db.getAll('products');
			ctx.reply("Welcome to Shop!", Markup.keyboard(
				buttons.map(element => {
					return Markup.button(element);
				})).extra())
			console.log('PRODUCTS', products)
			if (products.length === 0) {
				ctx.telegram.sendMessage(ctx.chat.id, "We haven't any products :(");
			} else {
				ctx.telegram.sendMessage(ctx.chat.id, "suka", Markup.inlineKeyboard([
					Markup.callbackButton("В корзину", "addToBasket"),
					Markup.callbackButton("Перейти в корзину", "goToBasket")
				]).extra())
			}
			start.on("text", async (ctx : TelegrafContext) => {
				if (ctx.message.text === "Admin panel") {
					// @ts-ignore
					ctx.scene.enter("adminPanel");
				}
			})
		});
		return start;
	}

	public adminPanel() {
		const adminPanel = new BaseScene("adminPanel");
		adminPanel.enter(async (ctx : TelegrafContext) => {
			let buttons = ["Add product"];
			ctx.reply("Admin Panel", Markup.keyboard(
				buttons.map(element => {
					return Markup.button(element);
				})).extra())
			adminPanel.on("text", async (ctx : TelegrafContext) => {
				if (ctx.message.text === "Add product") {
					// @ts-ignore
					ctx.scene.enter("addProduct");
				}
			})
		})
		return adminPanel;
	}
}