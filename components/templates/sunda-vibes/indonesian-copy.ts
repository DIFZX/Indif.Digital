import type { Invitation } from "@/lib/types";

// Older database seeds and local demos share these original Sunda phrases.
const defaultTranslations: Record<string, string> = {
  "Hatur Nuhun": "Terima Kasih",
  "Kalayan nyuhunkeun widi sareng ridho ti Gusti Allah SWT, simkuring saparakanca seja ngahaturanan uninga kana syukuran pernikahan putra-putri kami:": "Dengan memohon rahmat dan rida Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan putra-putri kami:",
  "Patepang dina hiji kasempetan anu saderhana, ngawitan silih kenal sareng silih ngabagi carita dugi ka tuwuh rasa asih anu tulus.": "Berawal dari pertemuan sederhana, kami saling mengenal dan berbagi cerita hingga tumbuh rasa cinta yang tulus.",
  "Perjalanan Asih": "Perjalanan Cinta",
  "Ngaliwatan sagala dinamika sareng kabagjaan sasarengan, nguatkeun komitmen kanggo silih damping dina kaayaan naon wae.": "Melalui berbagai cerita dan kebahagiaan bersama, kami menguatkan komitmen untuk saling mendampingi dalam setiap keadaan.",
  "Kalayan restu ti sepuh kadua pihak, kami ngalengkahkeun tekad kanggo ngabeungkeut jangji dina acara lamaran anu khidmat.": "Dengan restu kedua orang tua, kami memantapkan langkah untuk mengikat janji dalam acara lamaran yang khidmat.",
  "Kini dinten anu dinanti parantos cunduk, nyampurnakeun satengahing ageman dina ikatan suci pernikahan anu abadi.": "Kini hari yang dinantikan telah tiba. Kami siap memulai kehidupan bersama dalam ikatan suci pernikahan.",
  "Mangrupikeun hiji kahormatan sareng kabagjaan kanggo simkuring saparakanca saupami Bapak/Ibu/Saudara/i kersa sumping ngaluuhan sarta maparin doa restu ka kadua calon panganten. Hatur nuhun kana sagala perhatosan sareng kasaeanana.": "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai. Terima kasih atas perhatian dan doa baik yang diberikan.",
  "Hatur Nuhun. Kami yang berbahagia, Dita & Fajar": "Terima kasih. Kami yang berbahagia, Dita & Fajar"
};

function translateDefault(value: string | null | undefined): string {
  if (!value) return "";
  return defaultTranslations[value.trim()] ?? value;
}

export function localizeSundaInvitation(invitation: Invitation): Invitation {
  return {
    ...invitation,
    opening_text: translateDefault(invitation.opening_text),
    closing_text: translateDefault(invitation.closing_text),
    closing_greeting: translateDefault(invitation.closing_greeting),
    story: (invitation.story ?? []).map((item) => ({
      ...item,
      title: translateDefault(item.title),
      text: translateDefault(item.text),
    })),
  };
}
