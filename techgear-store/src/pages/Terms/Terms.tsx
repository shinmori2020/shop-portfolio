import React from 'react';
import './Terms.css';

export const Terms: React.FC = () => {
  return (
    <div className="terms">
      <div className="terms__container">
        <h1 className="terms__title">利用規約</h1>
        <p className="terms__updated">最終更新日: 2025年12月15日</p>

        <section className="terms__section">
          <h2 className="terms__section-title">第1条（適用）</h2>
          <p className="terms__text">
            本利用規約（以下、「本規約」といいます。）は、TechGear Store（以下、「当社」といいます。）が提供するオンラインストアサービス（以下、「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆さま（以下、「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
          </p>
          <p className="terms__note">
            ※本サイトはポートフォリオプロジェクトです。実際の商品販売・取引は行っておりません。
          </p>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第2条（利用登録）</h2>
          <ol className="terms__list">
            <li>本サービスの利用を希望する方は、本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。</li>
            <li>当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
              <ul className="terms__sublist">
                <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、当社が利用登録を相当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第3条（ユーザーIDおよびパスワードの管理）</h2>
          <ol className="terms__list">
            <li>ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。</li>
            <li>ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。</li>
            <li>ユーザーIDおよびパスワードの管理不十分、使用上の過誤、第三者の使用等によって生じた損害に関する責任はユーザーが負うものとします。</li>
          </ol>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第4条（売買契約）</h2>
          <ol className="terms__list">
            <li>本サービスにおいて、ユーザーが商品の購入を希望する場合、ユーザーは所定の方法で注文を行うものとします。</li>
            <li>商品の購入契約は、当社がユーザーの注文を承諾した時点で成立するものとします。</li>
            <li>未成年者が本サービスを利用する場合、法定代理人の同意を得た上で本サービスを利用してください。</li>
          </ol>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第5条（支払方法）</h2>
          <p className="terms__text">
            商品の代金支払いは、以下の方法から選択できます。
          </p>
          <ul className="terms__list">
            <li>クレジットカード決済（Visa、Mastercard、American Express、JCB）</li>
            <li>コンビニ決済</li>
            <li>銀行振込</li>
          </ul>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第6条（配送）</h2>
          <ol className="terms__list">
            <li>商品の配送は、当社が指定する配送業者によって行われます。</li>
            <li>配送料は購入金額や配送先によって異なります。詳細は配送ポリシーをご確認ください。</li>
            <li>配送の遅延、配送中の事故等による損害について、当社は責任を負いかねます。</li>
          </ol>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第7条（返品・交換）</h2>
          <ol className="terms__list">
            <li>商品の返品・交換については、当社の返品ポリシーに従うものとします。</li>
            <li>商品に不良や誤配送があった場合、商品到着後7日以内にご連絡ください。</li>
            <li>ユーザーの都合による返品は、未開封の場合に限り、商品到着後7日以内であれば可能です。</li>
          </ol>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第8条（禁止事項）</h2>
          <p className="terms__text">
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ul className="terms__list">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当社、本サービスの他のユーザー、または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
            <li>本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
            <li>当社のサービスの運営を妨害するおそれのある行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>不正な目的を持って本サービスを利用する行為</li>
            <li>本サービスの他のユーザーまたはその他の第三者に不利益、損害、不快感を与える行為</li>
            <li>当社が許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第9条（本サービスの提供の停止等）</h2>
          <ol className="terms__list">
            <li>当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
              <ul className="terms__sublist">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当社が本サービスの提供が困難と判断した場合</li>
              </ul>
            </li>
            <li>当社は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</li>
          </ol>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第10条（利用制限および登録抹消）</h2>
          <ol className="terms__list">
            <li>当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
              <ul className="terms__sublist">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>料金等の支払債務の不履行があった場合</li>
                <li>当社からの連絡に対し、一定期間返答がない場合</li>
                <li>本サービスについて、最終の利用から一定期間利用がない場合</li>
                <li>その他、当社が本サービスの利用を適当でないと判断した場合</li>
              </ul>
            </li>
            <li>当社は、本条に基づき当社が行った行為によりユーザーに生じた損害について、一切の責任を負いません。</li>
          </ol>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第11条（保証の否認および免責事項）</h2>
          <ol className="terms__list">
            <li>当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。</li>
            <li>当社は、本サービスに起因してユーザーに生じたあらゆる損害について、一切の責任を負いません。</li>
            <li>本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等については、当社は一切責任を負いません。</li>
          </ol>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第12条（サービス内容の変更等）</h2>
          <p className="terms__text">
            当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
          </p>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第13条（利用規約の変更）</h2>
          <ol className="terms__list">
            <li>当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。</li>
            <li>変更後の本規約は、当社ウェブサイトに掲示された時点から効力を生じるものとします。</li>
          </ol>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第14条（個人情報の取扱い）</h2>
          <p className="terms__text">
            当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。
          </p>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第15条（通知または連絡）</h2>
          <p className="terms__text">
            ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。当社は、ユーザーから、当社が別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。
          </p>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第16条（権利義務の譲渡の禁止）</h2>
          <p className="terms__text">
            ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
          </p>
        </section>

        <section className="terms__section">
          <h2 className="terms__section-title">第17条（準拠法・裁判管轄）</h2>
          <ol className="terms__list">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。</li>
          </ol>
        </section>

        <section className="terms__section">
          <p className="terms__end">以上</p>
        </section>
      </div>
    </div>
  );
};
