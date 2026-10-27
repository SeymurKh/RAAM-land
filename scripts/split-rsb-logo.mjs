import sharp from "sharp";

/**
 * Разрезка логотипа Radio Stream Bar на две части:
 * - rsb-mark.png     — красная мишень (кнопка в шапке)
 * - rsb-wordmark.png — вертикальный разделитель + надпись "RADIO STREAM BAR"
 *
 * Координаты вырезов вычислены попиксельно по public/assets/images/rsb-logo.png
 * (500x189, прозрачный фон): красный знак bbox x 10..143 / y 24..157,
 * разделитель x 170..173, текст до x 489.
 */

const SRC = "public/assets/images/rsb-logo.png";

// Мишень: красный круг + поле 7px вокруг
await sharp(SRC)
  .extract({ left: 3, top: 17, width: 148, height: 148 })
  .png()
  .toFile("public/assets/images/rsb-mark.png");

// Надпись: разделитель + "RADIO STREAM BAR"
await sharp(SRC)
  .extract({ left: 162, top: 0, width: 338, height: 189 })
  .png()
  .toFile("public/assets/images/rsb-wordmark.png");

console.log("OK: rsb-mark.png + rsb-wordmark.png");
