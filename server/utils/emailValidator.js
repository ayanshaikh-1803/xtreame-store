const dns = require('dns').promises;

// ─── Huge blocklist of fake/disposable email domains ─────────────────────────
const BLOCKED_DOMAINS = new Set([
  // Temp mail services
  'tempmail.com', 'temp-mail.org', 'tempmail.net', 'tempmail.io',
  'throwam.com', 'throwaway.email', 'trashmail.com', 'trashmail.net',
  'trashmail.me', 'trashmail.at', 'trashmail.io', 'trashmail.org',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info',
  'mailinator.com', 'mailinator.net', 'mailinator.org',
  'maildrop.cc', 'mailnull.com', 'mailnesia.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'spam4.me', 'spamgourmet.com', 'spamgourmet.net',
  'spamgourmet.org', 'spamhereplease.com', 'spamthisplease.com',
  'fakeinbox.com', 'fakemail.fr', 'fakemail.net',
  'dispostable.com', 'disposablemail.com', 'disposableinbox.com',
  'disposableemailaddresses.com', 'discard.email',
  'mailnull.com', 'mailsiphon.com', 'mailscrap.com',
  'mailexpire.com', 'mailfreeonline.com', 'mailguard.me',
  'mailhazard.com', 'mailhazard.us', 'mailimate.com',
  'mailin8r.com', 'mailinater.com', 'mailincubator.com',
  'mailismagic.com', 'mailme.ir', 'mailme.lv',
  'mailme24.com', 'mailmetrash.com', 'mailmoat.com',
  'mailnew.com', 'mailnull.com', 'mailpick.biz',
  'mailrock.biz', 'mailscrap.com', 'mailshell.com',
  'mailsiphon.com', 'mailslapping.com', 'mailslite.com',
  'mailsoul.com', 'mailtome.de', 'mailtothis.com',
  'mailtrash.net', 'mailtv.net', 'mailzilla.com',
  'mailzilla.org', 'makemetheking.com', 'malahov.de',
  'manifestgenerator.com', 'manybrain.com', 'mbx.cc',
  'mega.zik.dj', 'meinspamschutz.de', 'meltmail.com',
  'messagebeamer.de', 'mezimages.net', 'mfsa.ru',
  'mierdamail.com', 'migmail.net', 'migmail.pl',
  'migumail.com', 'mindless.com', 'mintemail.com',
  'misterpinball.de', 'mjukglass.nu', 'moakt.cc',
  'moakt.co', 'moakt.com', 'moakt.ws',
  'mohmal.com', 'moncourrier.fr.nf', 'monemail.fr.nf',
  'monmail.fr.nf', 'monumentmail.com', 'mox.pp.ua',
  'mt2009.com', 'mt2014.com', 'mt2015.com',
  'mycleaninbox.net', 'myemailboxy.com', 'mymail-in.net',
  'mymailoasis.com', 'mynetstore.de', 'mypacks.net',
  'mypartyclip.de', 'myphantomemail.com', 'myspaceinc.com',
  'myspaceinc.net', 'myspaceinc.org', 'myspacepimpedup.com',
  'myspamless.com', 'mytemp.email', 'mytempemail.com',
  'mytempmail.com', 'mytrashmail.com', 'mywarnmail.com',
  'netzidiot.de', 'neverbox.com', 'nice-4u.com',
  'nincsmail.com', 'nnh.com', 'no-spam.ws',
  'noblepioneer.com', 'nomail.pw', 'nomail.xl.cx',
  'nomail2me.com', 'nomorespamemails.com', 'nonspam.eu',
  'nonspammer.de', 'noref.in', 'norseforce.com',
  'nospam.ze.tc', 'nospam4.us', 'nospamfor.us',
  'nospammail.net', 'nospamthanks.info', 'notmailinator.com',
  'nowmymail.com', 'nwldx.com', 'objectmail.com',
  'obobbo.com', 'odaymail.com', 'odnorazovoe.ru',
  'ohaaa.de', 'omail.pro', 'one-time.email',
  'oneoffemail.com', 'oneoffmail.com', 'onewaymail.com',
  'onlatedotcom.info', 'online.ms', 'oopi.org',
  'opayq.com', 'opentrash.com', 'ordinaryamerican.net',
  'otherinbox.com', 'ourklips.com', 'outlawspam.com',
  'ovpn.to', 'owlpic.com', 'ownsyou.de',
  'oxopoha.com', 'ozyl.de', 'pagamenti.tk',
  'pancakemail.com', 'paplease.com', 'pcusers.otherinbox.com',
  'pepbot.com', 'pfui.ru', 'phentermine-mortgages.com',
  'pimpedupmyspace.com', 'pjjkp.com', 'plexolan.de',
  'poczta.onet.pl', 'politikerclub.de', 'poofy.org',
  'pookmail.com', 'pop3.xyz', 'postacı.com',
  'postfach2go.de', 'privacy.net', 'privatdemail.net',
  'proxymail.eu', 'prtnx.com', 'prtz.eu',
  'punkass.com', 'putthisinyourspamdatabase.com', 'pwrby.com',
  'qq.com', 'quickinbox.com', 'quickmail.nl',
  'rcpt.at', 'reallymymail.com', 'recode.me',
  'recursor.net', 'recyclemail.dk', 'regbypass.com',
  'regbypass.comsafe-mail.net', 'rejectmail.com', 'reliable-mail.com',
  'rhyta.com', 'rklips.com', 'rmqkr.net',
  'royal.net', 'rppkn.com', 'rtrtr.com',
  's0ny.net', 'safe-mail.net', 'safersignup.de',
  'safetymail.info', 'safetypost.de', 'sandelf.de',
  'saynotospams.com', 'schafmail.de', 'schrott-email.de',
  'secretemail.de', 'secure-mail.biz', 'secure-mail.cc',
  'selfdestructingmail.com', 'sendspamhere.com', 'senseless-entertainment.com',
  'services391.com', 'sharklasers.com', 'shieldedmail.com',
  'shiftmail.com', 'shitmail.de', 'shitmail.me',
  'shitmail.org', 'shitware.nl', 'shortmail.net',
  'sibmail.com', 'sinnlos-mail.de', 'skeefmail.com',
  'slapsfromlastnight.com', 'slaskpost.se', 'slave-auctions.net',
  'slopsbox.com', 'slushmail.com', 'smapfree24.com',
  'smapfree24.de', 'smapfree24.eu', 'smapfree24.info',
  'smapfree24.net', 'smapfree24.org', 'smellfear.com',
  'smellrear.com', 'smileyface.comsafe-mail.net', 'smokemail.net',
  'snakemail.com', 'sneakemail.com', 'sneakmail.de',
  'snkmail.com', 'sofimail.com', 'sofort-mail.de',
  'sogetthis.com', 'soisz.com', 'solar-impact.pro',
  'solvemail.info', 'soodonims.com', 'spam.la',
  'spam.su', 'spam4.me', 'spamavert.com',
  'spambob.com', 'spambob.net', 'spambob.org',
  'spambog.com', 'spambog.de', 'spambog.ru',
  'spambox.info', 'spambox.irishspringrealty.com', 'spambox.us',
  'spamcannon.com', 'spamcannon.net', 'spamcero.com',
  'spamcon.org', 'spamcorptastic.com', 'spamcowboy.com',
  'spamcowboy.net', 'spamcowboy.org', 'spamday.com',
  'spamex.com', 'spamfree.eu', 'spamfree24.de',
  'spamfree24.eu', 'spamfree24.info', 'spamfree24.net',
  'spamfree24.org', 'spamgoes.in', 'spamgourmet.com',
  'spamgourmet.net', 'spamgourmet.org', 'spamherelots.com',
  'spamhereplease.com', 'spamhole.com', 'spamify.com',
  'spaminator.de', 'spamkill.info', 'spaml.com',
  'spaml.de', 'spammotel.com', 'spammy.host',
  'spamoff.de', 'spamslicer.com', 'spamspot.com',
  'spamstack.net', 'spamthis.co.uk', 'spamthisplease.com',
  'spamtroll.net', 'spamwc.de', 'spamwc.net',
  'spamwc.org', 'spamz.de', 'spamzilla.com',
  'spamzilla.pl', 'speed.1s.fr', 'spoofmail.de',
  'squizzy.de', 'squizzy.eu', 'squizzy.net',
  'ssoia.com', 'startkeys.com', 'stinkefinger.net',
  'storemail.info', 'stuffmail.de', 'super-auswahl.de',
  'supergreatmail.com', 'supermailer.jp', 'superrito.com',
  'superstachel.de', 'suremail.info', 'svk.jp',
  'sweetxxx.de', 'tafmail.com', 'tagyourself.com',
  'teewars.org', 'teleworm.com', 'teleworm.us',
  'tempalias.com', 'tempe-mail.com', 'tempemail.biz',
  'tempemail.com', 'tempemail.net', 'tempinbox.co.uk',
  'tempinbox.com', 'tempmail.com', 'tempmail.de',
  'tempmail.eu', 'tempmail.it', 'tempmail.net',
  'tempmail.org', 'tempmail.us', 'tempmail2.com',
  'tempomail.fr', 'temporaryemail.net', 'temporaryemail.us',
  'temporaryforwarding.com', 'temporaryinbox.com', 'temporarymailaddress.com',
  'tempsky.com', 'tempthe.net', 'tempymail.com',
  'thanksnospam.info', 'thc.st', 'thelimestones.com',
  'thisisnotmyrealemail.com', 'thismail.net', 'throwam.com',
  'throwaway.email', 'throwam.com', 'tilien.com',
  'tittbit.in', 'tizi.com', 'tmailinator.com',
  'toiea.com', 'toomail.biz', 'topranklist.de',
  'tradermail.info', 'trash-mail.at', 'trash-mail.com',
  'trash-mail.de', 'trash-mail.ga', 'trash-mail.io',
  'trash-mail.net', 'trash2009.com', 'trash2010.com',
  'trash2011.com', 'trashdevil.com', 'trashdevil.de',
  'trashemail.de', 'trashimail.de', 'trashmail.at',
  'trashmail.com', 'trashmail.io', 'trashmail.me',
  'trashmail.net', 'trashmail.org', 'trashmail.xyz',
  'trashmailer.com', 'trashspam.com', 'trillianpro.com',
  'trmailbox.com', 'tropicalbass.info', 'trwv.com',
  'turual.com', 'twinmail.de', 'tyldd.com',
  'uggsrock.com', 'umail.net', 'unids.com',
  'unimark.org', 'unit7lahaina.com', 'unmail.ru',
  'uroid.com', 'us.af', 'username.e4ward.com',
  'utiket.us', 'uu.gl', 'uwork4.us',
  'venompen.com', 'veryrealemail.com', 'viditag.com',
  'viewcastmedia.com', 'viewcastmedia.net', 'viewcastmedia.org',
  'viralplays.com', 'vkcode.ru', 'vomoto.com',
  'vpn.st', 'vsimcard.com', 'vubby.com',
  'walala.org', 'walkmail.net', 'walkmail.ru',
  'webemail.me', 'webm4il.info', 'webuser.in',
  'wee.my', 'weg-werf-email.de', 'wegwerf-email.at',
  'wegwerf-email.de', 'wegwerf-email.net', 'wegwerf-email.org',
  'wegwerfadresse.de', 'wegwerfemail.com', 'wegwerfemail.de',
  'wegwerfemail.net', 'wegwerfemail.org', 'wegwerfmail.de',
  'wegwerfmail.info', 'wegwerfmail.net', 'wegwerfmail.org',
  'wetrainbayarea.com', 'wetrainbayarea.org', 'wh4f.org',
  'whyspam.me', 'wickmail.net', 'wilemail.com',
  'willhackforfood.biz', 'willselfdestruct.com', 'winemaven.info',
  'wronghead.com', 'wuzupmail.net', 'www.e4ward.com',
  'www.gishpuppy.com', 'www.mailinator.com', 'wwwnew.eu',
  'x.ip6.li', 'xagloo.co', 'xagloo.com',
  'xemaps.com', 'xents.com', 'xmaily.com',
  'xoxy.net', 'xsmail.com', 'xww.ro',
  'xyzfree.net', 'yapped.net', 'yeah.net',
  'yep.it', 'yogamaven.com', 'yopmail.com',
  'yopmail.fr', 'yopmail.net', 'yourdomain.com',
  'ypmail.webarnak.fr.eu.org', 'yuurok.com', 'z1p.biz',
  'za.com', 'zehnminuten.de', 'zehnminutenmail.de',
  'zetmail.com', 'zippymail.info', 'zoaxe.com',
  'zoemail.com', 'zoemail.net', 'zoemail.org',
  'zomg.info', 'zxcv.com', 'zxcvbnm.com',
  'zzz.com',
  // Indian fake mail services
  'mailtemp.in', 'tempmail.in', 'spammail.in',
]);

// ─── Check if email domain has valid MX records ───────────────────────────────
const hasMXRecord = async (domain) => {
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
};

// ─── Main validator ───────────────────────────────────────────────────────────
const validateEmail = async (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email is required' };
  }

  const emailLower = email.toLowerCase().trim();

  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(emailLower)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  const domain = emailLower.split('@')[1];

  // Check against blocklist
  if (BLOCKED_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Disposable/fake email addresses are not allowed. Please use a real email.' };
  }

  // Only block clearly fake prefixes (exact match, not partial)
  const suspiciousPatterns = [
    /^(trash|spam|fake|dummy)@/i,   // exact fake prefixes only
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(emailLower)) {
      return { valid: false, reason: 'This email address looks suspicious. Please use a real email.' };
    }
  }

  // MX record check — does this domain actually receive emails?
  const mxExists = await hasMXRecord(domain);
  if (!mxExists) {
    return { valid: false, reason: `Email domain "${domain}" does not exist or cannot receive emails.` };
  }

  return { valid: true };
};

module.exports = validateEmail;
