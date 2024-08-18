import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-privacy-security-reporting',
  templateUrl: './privacy-security-reporting.component.html',
  styleUrls: ['./privacy-security-reporting.component.scss']
})
export class PrivacySecurityReportingComponent {
  @Input() selectedMenuItem!: string;
  @Input() selectedSubMenuItem!: string;
  @Input() selectedSubSubMenuItem!: string;

  visibleContentLabels: string[] = [];

  loginPasswordsItems: { [key: string]: { label: string, content: string, icon: string }[] } = {
    'cant-log-in': [
      {
        label: 'Reset Your Password',
        content: `
          <p>To reset your password:</p>
          <ol style="list-style-type: decimal;">
            <li class="mt-2">Go to the login page and click on <strong>Forgot password?</strong>.</li>
            <li class="mt-2">Enter your email address and click <strong>Submit</strong>.</li>
            <li class="mt-2">Check your email for the password reset link and follow the instructions.</li>
          </ol>
        `,
        icon: 'pi pi-lock font-bold mx-2',
      }
    ],
    'hacked-account': [
      {
        label: 'Report Hacked Account',
        content: `
          <p>If you believe your account has been hacked:</p>
          <ol style="list-style-type: decimal;">
            <li class="mt-2">Go to the <a href="https://help.syncio.com">Help Center</a> and navigate to the hacked accounts section.</li>
            <li class="mt-2">Follow the instructions provided to secure your account.</li>
          </ol>
        `,
        icon: 'pi pi-exclamation-circle font-bold mx-2',
      }
    ],
    'keep-account-secure': [
      {
        label: 'Tips for Security',
        content: `
          <p>To keep your account secure:</p>
          <ol style="list-style-type: decimal;">
            <li class="mt-2">Use a strong and unique password for your account.</li>
            <li class="mt-2">Enable two-factor authentication.</li>
            <li class="mt-2">Be cautious of suspicious links and messages.</li>
          </ol>
        `,
        icon: 'pi pi-shield font-bold mx-2',
      }
    ],
    'syncio-web': [
      {
        label: 'Using Syncio on the Web',
        content: `
          <p>To use Syncio on the web:</p>
          <ol style="list-style-type: decimal;">
            <li class="mt-2">Visit <a href="https://www.syncio.com">www.syncio.com</a> and log in with your credentials.</li>
            <li class="mt-2">Navigate through your feed, explore, and interact with posts.</li>
          </ol>
        `,
        icon: 'pi pi-globe font-bold mx-2',
      }
    ]
  };

  reportThingsItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Report a Post',
      content: `
        <p>To report a post:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Log in to your account and navigate to the post you want to report.</li>
          <li class="mt-2">Click on the <strong>three dots</strong> (more options) icon on the post.</li>
          <li class="mt-2">From the dropdown menu, select <strong>Report</strong>.</li>
          <li class="mt-2">Choose the reason for reporting the post from the available options.</li>
          <li class="mt-2">Provide any additional information if prompted.</li>
          <li class="mt-2">Click <strong>Submit</strong> to send your report.</li>
          <li class="mt-2">You will receive a confirmation that your report has been submitted.</li>
        </ol>
      `,
      icon: 'pi pi-exclamation-triangle font-bold mx-2',
    }
  ];

  impersonationAccountsItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Report Impersonation',
      content: `
        <p>To report an account for impersonation:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Navigate to the profile of the account you believe is impersonating someone.</li>
          <li class="mt-2">Click on the <strong>three dots</strong> (more options) icon on their profile page.</li>
          <li class="mt-2">Select <strong>Report</strong> from the dropdown menu.</li>
          <li class="mt-2">Choose the option indicating it’s an impersonation report.</li>
          <li class="mt-2">Provide any additional details, such as the name of the person being impersonated.</li>
          <li class="mt-2">Click <strong>Submit</strong> to send your report.</li>
          <li class="mt-2">You may receive a confirmation that your report has been submitted for review.</li>
        </ol>
      `,
      icon: 'pi pi-user font-bold mx-2',
    }
  ];

  communityGuidelinesItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Community Guidelines',
      content: `
         <h3>The Short</h3>
    <p>We want Instagram to continue to be an authentic and safe place for inspiration and expression. Help us foster this community. Post only your own photos and videos and always follow the law. Respect everyone on Instagram, don’t spam.</p>

    <h3>The Long</h3>
    <p>Instagram is a reflection of our diverse community of cultures, ages, and beliefs. We’ve spent a lot of time thinking about the different points of view that create a safe and open environment for everyone.</p>

    <p>We created the Community Guidelines so you can help us foster and protect this amazing community. By using Instagram, you agree to these guidelines and our Terms of Use. We’re committed to these guidelines and we hope you are too. Overstepping these boundaries may result in deleted content, <a href="#">disabled accounts</a>, or other restrictions.</p>

    <p>In some cases, we allow content for public awareness which would otherwise go against our Community Guidelines – if it is newsworthy and in the public interest. We do this only after weighing the public interest value against the risk of harm and we look to international human rights standards to make these judgments.</p>

    <ul>
        <li><strong>Share only photos and videos that you’ve taken or have the right to share.</strong>
            <p>As always, you own the content you post on Instagram. Remember to post authentic content, and don’t post anything you’ve copied or collected from the Internet that you don’t have the right to post. Learn more about <a href="#">intellectual property rights</a>.</p>
        </li>
        <li><strong>Post photos and videos that are appropriate for a diverse audience.</strong>
            <p>We know that there are times when people might want to share nude images that are artistic or creative in nature, but for a variety of reasons, we don’t allow nudity on Instagram. This includes photos, videos, and some digitally-created content that show sexual intercourse, genitals, and close-ups of fully-nude buttocks. It also includes some photos of female nipples, but photos in the context of breastfeeding, birth giving and after-birth moments, health-related situations (for example, post-mastectomy, breast cancer awareness or gender confirmation surgery) or an act of protest are allowed. Nudity in photos of paintings and sculptures is OK, too.</p>
<p>People like to share photos or videos of their children. For safety reasons, there are times when we may remove images that show nude or partially-nude children. Even when this content is shared with good intentions, it could be used by others in unanticipated ways. You can learn more on our Tips for Parents page..</p>
        </li>
    </ul>
     <ul>
        <li><strong>Foster meaningful and genuine interactions.</strong>
            <p>Help us stay <a href="#">spam-free</a> by not artificially collecting likes, followers, or shares, posting repetitive comments or content, or repeatedly contacting people for commercial purposes without their consent. Don’t offer money or giveaways of money in exchange for likes, followers, comments or other engagement. Don’t post content that engages in, promotes, encourages, facilitates, or admits to the offering, solicitation or trade of <a href="#">fake and misleading user reviews or ratings</a>.</p>
            <p>You don’t have to use your real name on Instagram, but we do require Instagram users to provide us with accurate and up to date information. Don't <a href="#">impersonate</a> others and don't create accounts for the purpose of violating our guidelines or misleading others.</p>
        </li>
        
        <li><strong>Follow the law.</strong>
            <p>Instagram is not a place to support or praise <a href="#">terrorism</a>, <a href="#">organized crime</a>, or <a href="#">hate groups</a>. Offering <a href="#">sexual services</a>, buying or selling firearms, alcohol, and tobacco products between private individuals, and buying or selling non-medical or pharmaceutical drugs are also not allowed. We also remove content that attempts to trade, co-ordinate the trade of, donate, gift, or ask for non-medical drugs, as well as content that either admits to personal use (unless in the recovery context) or coordinates or promotes the use of non-medical drugs. Instagram also prohibits the sale of live animals between private individuals, though brick-and-mortar stores may offer these sales. No one may coordinate poaching or selling of endangered species or their parts.</p>
            <p>Remember to always follow the law when offering to sell or buy other <a href="#">regulated goods</a>. Accounts promoting online gambling, online real money games of skill or online lotteries must get our prior written permission before using any of our products.</p>
            <p>We have zero tolerance when it comes to sharing <a href="#">sexual content</a> involving minors or threatening to post <a href="#">intimate images</a> of others.</p>
        </li>
    </ul>
        <ul>
        <li><strong>Respect other members of the Instagram community.</strong>
            <p>We want to foster a positive, diverse community. We remove content that contains <a href="#">credible threats</a> or <a href="#">hate speech</a>, content that targets private individuals to <a href="#">degrade or shame them</a>, personal information meant to blackmail or harass someone, and repeated unwanted messages. We do generally allow stronger conversation around people who are featured in the news or have a large public audience due to their profession or chosen activities.</p>
            <p>It's never OK to encourage violence or attack anyone based on their race, ethnicity, national origin, sex, gender, gender identity, sexual orientation, religious affiliation, disabilities, or diseases. When hate speech is being shared to challenge it or to raise awareness, we may allow it. In those instances, we ask that you express your intent clearly.</p>
            <p><a href="#">Serious threats of harm</a> to public and personal safety aren't allowed. This includes specific threats of physical harm as well as threats of theft, vandalism, and other financial harm. We carefully review reports of threats and consider many things when determining whether a threat is credible.</p>
        </li>
        
        <li><strong>Maintain our supportive environment by not glorifying self-injury.</strong>
            <p>The Instagram community cares for each other, and is often a place where people facing difficult issues such as eating disorders, cutting, or other kinds of self-injury come together to create awareness or find support. We try to do our part by providing education in the app and adding information in the <a href="#">Help Center</a> so people can get the help they need.</p>
            <p>Encouraging or urging people to embrace <a href="#">self-injury</a> is counter to this environment of support, and we’ll remove it or disable accounts if it’s reported to us. We may also remove content identifying victims or survivors of self-injury if the content targets them for attack or humor.</p>
        </li>
    </ul>
        <h4>Help us keep the community strong:</h4>
    <ul>
        <li><strong>Each of us is an important part of the Instagram community.</strong>
            <p>If you see something that you think may violate our guidelines, please help us by using our <a href="#">built-in reporting option</a>. We have a global team that reviews these reports and works as quickly as possible to remove content that doesn’t meet our guidelines. Even if you or someone you know doesn’t have an Instagram account, you can still <a href="#">file a report</a>. When you complete the report, try to provide as much information as possible, such as links, usernames, and descriptions of the content, so we can find and review it quickly. We may remove entire posts if either the imagery or associated captions violate our guidelines.</p>
        </li>

        <li><strong>You may find content you don’t like, but doesn’t violate the Community Guidelines.</strong>
            <p>If that happens, you can <a href="#">unfollow</a> or <a href="#">block</a> the person who posted it. If there's something you don't like in a comment on one of your posts, you can <a href="#">delete that comment</a>.</p>
        </li>

        <li><strong>Many disputes and misunderstandings can be resolved directly between members of the community.</strong>
            <p>If one of your photos or videos was posted by someone else, you could try commenting on the post and asking the person to take it down. If that doesn’t work, you can <a href="#">file a copyright report</a>. If you believe someone is violating your trademark, you can <a href="#">file a trademark report</a>. Don't target the person who posted it by posting screenshots and drawing attention to the situation because that may be classified as harassment.</p>
        </li>

        <li><strong>We may work with law enforcement, including when we believe that there’s risk of physical harm or threat to public safety.</strong></li>
    </ul>

    <p>For more information, check out our <a href="#">Help Center</a> and <a href="#">Terms of Use</a>.</p>
    <p>Thank you for helping us create one of the best communities in the world,</p>
    <p>The Instagram Team</p>
      `,
      icon: 'pi pi-users mx-2 font-bold'
    }
    // Add more items as needed
  ];


  toggleContent(label: string) {
    const index = this.visibleContentLabels.indexOf(label);
    if (index === -1) {
      this.visibleContentLabels.push(label);
    } else {
      this.visibleContentLabels.splice(index, 1);
    }
  }

  isContentVisible(label: string): boolean {
    return this.visibleContentLabels.includes(label);
  }

  getSubSubMenuTitle(subSubMenuItem: string): string {
    const titles: { [key: string]: string } = {
      'cant-log-in': 'I Can\'t Log In',
      'hacked-account': 'Hacked Syncio Account',
      'keep-account-secure': 'How to keep your Syncio account secure',
      'syncio-web': 'Syncio on the Web'
    };
    return titles[subSubMenuItem] || '';
  }
}
