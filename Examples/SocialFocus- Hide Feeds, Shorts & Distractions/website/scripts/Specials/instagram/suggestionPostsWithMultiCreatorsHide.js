const keyWords = [
  "Voorgestel vir jou",
  "اقتراحات قد تعجبك",
  "Návrhy pro vás",
  "Foreslået til dig",
  "Für dich vorgeschlagen",
  "Προτείνονται για εσάς",
  "Suggested for you",
  "Suggested post",
  "Sugerencia para ti",
  "پیشنهادشده برای شما",
  "Sinulle ehdotettua",
  "Suggestions pour vous",
  "הצעות בשבילך",
  "Disarankan untuk Anda",
  "Suggeriti per te",
  "おすすめ",
  "회원님을 위한 추천",
  "Dicadangkan untuk anda",
  "Foreslått for deg",
  "Aanbevolen voor jou",
  "Propozycje dla Ciebie",
  "Sugestões para você",
  "Sugestões para ti",
  "Рекомендации для вас",
  "Förslag för dig",
  "แนะนำสำหรับคุณ",
  "Sina-suggest para sa iyo",
  "Senin için önerilenler",
  "为你推荐",
  "為你推薦",
  "আপনার জন্য প্রস্তাবিত",
  "તમારા માટે સૂચવેલું",
  "आपके लिए सुझाई गई",
  "Predloženo za vas",
  "Neked javasoltak",
  "ನಿಮಗಾಗಿ ಸಲಹೆ ನೀಡಲಾಗಿದೆ",
  "നിങ്ങൾക്കായി നിർദ്ദേശിച്ചത്",
  "तुमच्यासाठी सुचवलेली",
  "तपाईंका लागि सिफारिस गरिएको",
  "ਤੁਹਾਡੇ ਲਈ ਸੁਝਾਏ ਗਏ",
  "ඔබ සඳහා යෝජිත",
  "Návrhy pre vás",
  "உங்களுக்காகப் பரிந்துரைக்கப்பட்டவை",
  "మీ కోసం సూచించబడినవి",
  "آپ کیلئے تجویز کردہ",
  "Gợi ý cho bạn",
  "為你推薦",
  "Предложено за вас",
  "Suggestions pour vous",
  "Sugestii pentru tine",
  "Предлажемо за вас",
  "Рекомендовано для вас",
];

function hideSuggestedPostInstagram(value) {
  const suggestedPostsObserver = new MutationObserver(() => {
    const elements = document.querySelectorAll("main[role='main'] article");

    if (elements) {
      const suggestePostsArticle = [
        ...document.querySelectorAll("article"),
      ].filter((article) => {
        return [...article.querySelectorAll("span")].some((span) => {
          const text = span.textContent.trim();
          return keyWords.includes(text);
        });
      });

      if (value) {
        suggestePostsArticle.forEach((item) => {
          if (!item.hasAttribute("suggestedPost")) {
            item.setAttribute("suggestedPost", "true");
          }
        });
      } else {
        suggestePostsArticle.forEach((item) => {
          if (item.hasAttribute("suggestedPost")) {
            item.removeAttribute("suggestedPost");
          }
        });
      }
    }
  });

  if (value) {
    const waitForMainObserver = new MutationObserver(() => {
      const main = document.querySelector('main[role="main"]');

      if (main) {
        waitForMainObserver.disconnect();

        suggestedPostsObserver.observe(main, {
          childList: true,
          subtree: true,
        });
      }
    });

    waitForMainObserver.observe(document, {
      childList: true,
      subtree: true,
    });
  } else {
    suggestedPostsObserver.disconnect();
  }
}
