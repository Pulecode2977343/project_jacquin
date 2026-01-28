/**
 * Shared User Profile Modal Logic
 * Centralizes the unified tabbed modal for user management across different pages.
 */

window.closeProfileModal = function () {
    const modal = document.getElementById("user-profile-modal");
    if (!modal) return;
    modal.style.opacity = "0";
    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
};

window.openPositionDocument = async function (positionId, positionName, userName) {
    if (window.showToast) showToast("Generando documento oficial...", "info");

    try {
        const res = await ApiService.getPositionFunctions(positionId);
        if (!res.success) throw new Error(res.message);

        const functions = res.data || [];
        const date = new Date().toLocaleDateString();

        let docModal = document.getElementById("position-doc-modal");
        if (!docModal) {
            docModal = document.createElement("div");
            docModal.id = "position-doc-modal";
            docModal.className = "modal-overlay";
            docModal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 5, 10, 0.9); z-index: 110000;
                display: flex; justify-content: center; align-items: center;
                opacity: 0; transition: opacity 0.3s ease; backdrop-filter: blur(10px);
            `;
            document.body.appendChild(docModal);
        }

        docModal.innerHTML = `
            <div style="width: 95%; max-width: 800px; height: 90vh; background: white; border-radius: 10px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); animation: zoomIn 0.3s ease-out;">
                <div style="background: #1a2a3a; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; color: white;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="bi bi-file-earmark-pdf-fill" style="color: #ff7675; font-size: 1.4rem;"></i>
                        <span style="font-weight: 600; font-size: 0.95rem;">Manual de Funciones - ${positionName}</span>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.printPositionDoc()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem;">
                            <i class="bi bi-printer"></i> Imprimir / PDF
                        </button>
                        <button onclick="document.getElementById('position-doc-modal').style.opacity='0'; setTimeout(()=>document.getElementById('position-doc-modal').style.display='none', 300)" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; margin-left: 10px;">&times;</button>
                    </div>
                </div>
                
                <div id="printable-doc-area" style="flex: 1; overflow-y: auto; padding: 60px; background: #e0e0e0; display: flex; justify-content: center;">
                    <div class="paper-sheet" style="width: 100%; max-width: 210mm; background: white; padding: 50px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); color: #333; font-family: 'Poppins', sans-serif; min-height: 297mm; position: relative; text-align: left;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a2a3a; padding-bottom: 20px; margin-bottom: 40px;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="height: 45px; display: flex; align-items: center;">
                                    <svg width="180" height="40" viewBox="0 0 239 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.7215 7.09447V18.7566C11.7215 21.1631 11.117 22.9725 9.90792 24.1829C8.69881 25.3943 6.8269 26 4.29246 26C3.75763 26 3.23456 25.9627 2.72294 25.888C2.21147 25.8134 1.75803 25.7005 1.36278 25.5512C0.967389 25.402 0.641935 25.2077 0.386126 24.9685C0.130317 24.7436 0.00248493 24.4824 0.00248493 24.1829C-0.0207299 23.8997 0.118707 23.6299 0.421095 23.3763C0.700119 23.1218 1.1418 22.9725 1.74643 22.9275C2.04866 22.9122 2.3393 22.9352 2.61832 22.9945C2.92056 23.0548 3.17637 23.1371 3.3856 23.2414C3.59498 23.361 3.75763 23.4883 3.874 23.6222C4.01344 23.7724 4.08324 23.9141 4.08324 24.049C4.08324 24.2882 4.15303 24.4748 4.29246 24.6097C4.43205 24.7436 4.73429 24.8116 5.19933 24.8116C6.15263 24.8116 6.8269 24.4528 7.22229 23.7351C7.64075 23.0175 7.84999 21.8358 7.84999 20.1919V7.09447C7.84999 6.63135 7.81517 6.27253 7.74537 6.01801C7.67573 5.74913 7.52453 5.54723 7.29194 5.41232C7.08271 5.27836 6.75726 5.19607 6.31543 5.16545C5.8736 5.12144 5.28073 5.09847 4.53667 5.09847V4C5.04814 4.02966 5.7806 4.05167 6.73389 4.06698C7.68734 4.06698 8.68706 4.06698 9.73351 4.06698C10.7798 4.06698 11.7797 4.06698 12.733 4.06698C13.6863 4.05167 14.442 4.03732 15 4.02201V5.09847C14.2327 5.09847 13.6282 5.12144 13.1864 5.16545C12.7678 5.19607 12.4424 5.27836 12.2098 5.41232C12.0005 5.54723 11.8611 5.74913 11.7913 6.01801C11.7447 6.27253 11.7215 6.63135 11.7215 7.09447Z" fill="#1a2a3a"/><path d="M64.5578 5.59548L64.9057 10.3258H63.1052C62.8105 8.5906 62.1474 7.3498 61.1158 6.60341C60.0841 5.85702 58.6526 5.48322 56.8211 5.48322C55.5368 5.48322 54.3368 5.70774 53.2211 6.15558C52.1264 6.5843 51.1684 7.20052 50.3474 8.00304C49.5264 8.78645 48.8842 9.74661 48.4211 10.8859C47.9579 12.0049 47.7264 13.2552 47.7264 14.6358C47.7264 16.1476 47.979 17.5091 48.4843 18.7224C48.9896 19.9357 49.6737 20.9711 50.5369 21.8298C51.421 22.6872 52.4422 23.35 53.6 23.817C54.7789 24.2827 56.021 24.5168 57.3264 24.5168C58.9474 24.5168 60.2315 24.0594 61.1789 23.1446C62.1263 22.231 62.7579 21.0081 63.0737 19.4783H65L64.1157 24.4045C63.7368 24.6278 63.2421 24.8428 62.6316 25.0482C62.0421 25.2345 61.4105 25.3933 60.7368 25.5235C60.0631 25.6728 59.3789 25.785 58.6842 25.8603C57.9894 25.9534 57.3579 26 56.7894 26C54.8948 26 53.1579 25.7289 51.5789 25.1879C50.0211 24.647 48.6737 23.8815 47.5368 22.8926C46.4211 21.9038 45.5474 20.7191 44.9158 19.3386C44.3053 17.939 44 16.3996 44 14.7205C44 13.1716 44.358 11.7434 45.0737 10.4381C45.7896 9.11247 46.7369 7.97438 47.9158 7.02258C49.0948 6.07078 50.4421 5.33395 51.9579 4.81207C53.4947 4.27109 55.0737 4 56.6947 4C58.0843 4 59.4421 4.15884 60.7683 4.4753C62.1157 4.79297 63.3789 5.16676 64.5578 5.59548Z" fill="#1a2a3a"/><path d="M84.8476 24.9897C85.2769 25.5131 85.7763 25.9557 86.3433 26.3163C86.9104 26.6779 87.5562 26.9576 88.2797 27.1564C89.0232 27.3551 89.8631 27.4811 90.8019 27.5354C91.7407 27.5897 92.8071 27.5631 94 27.4545V28.6459C92.6707 28.899 91.3702 29.0157 90.0984 28.9983C88.8267 28.9983 87.6238 28.8631 86.4898 28.5916C85.3758 28.3212 84.3381 27.9063 83.3806 27.3459C82.4418 26.7866 81.6495 26.0644 81.0036 25.1792C79.6155 25.0891 78.3149 24.7459 77.102 24.1507C75.8891 23.5545 74.834 22.7872 73.934 21.8477C73.034 20.8909 72.3205 19.8081 71.7923 18.5982C71.2641 17.3699 71 16.0884 71 14.7525C71 13.434 71.2641 12.134 71.7923 10.8525C72.3393 9.55249 73.1029 8.39692 74.0804 7.3858C75.058 6.37469 76.2321 5.56232 77.6015 4.94756C78.9696 4.31547 80.4954 4 82.1777 4C83.7035 4 85.1404 4.28889 86.4898 4.86667C87.8391 5.44446 89.0132 6.22099 90.0108 7.19629C91.0084 8.1531 91.7908 9.27168 92.3578 10.5544C92.9436 11.8185 93.2377 13.1451 93.2377 14.5353C93.2377 15.6908 93.0324 16.8372 92.6219 17.9754C92.2301 19.094 91.6631 20.1328 90.9196 21.0896C90.1961 22.0291 89.3161 22.8496 88.2797 23.5545C87.2433 24.2409 86.0993 24.7193 84.8476 24.9897ZM89.6003 15.3476C89.6003 14.6439 89.5214 13.9124 89.3649 13.1544C89.2285 12.3778 89.0132 11.629 88.7191 10.9068C88.4462 10.1661 88.0932 9.47044 87.6639 8.82101C87.2333 8.1531 86.7251 7.57531 86.1381 7.08766C85.571 6.58153 84.9252 6.18517 84.2017 5.89628C83.4782 5.5889 82.6759 5.43521 81.7959 5.43521C80.7395 5.43521 79.7719 5.64321 78.892 6.05806C78.012 6.47406 77.2485 7.05184 76.6039 7.7914C75.978 8.53212 75.4886 9.42537 75.1369 10.4735C74.7851 11.5204 74.6086 12.676 74.6086 13.9402C74.6086 14.9871 74.7751 16.0976 75.1068 17.2705C75.4398 18.4261 75.9292 19.4915 76.5738 20.4668C77.2397 21.4421 78.0608 22.2544 79.0384 22.9039C80.016 23.536 81.1513 23.8526 82.4418 23.8526C83.5758 23.8526 84.5834 23.6446 85.4634 23.2298C86.3433 22.8138 87.0869 22.236 87.6927 21.4964C88.3185 20.7372 88.7879 19.8439 89.1008 18.8143C89.4338 17.7674 89.6003 16.6118 89.6003 15.3476Z" fill="#1a2a3a"/><path d="M122 4V5.42132C121.423 5.42132 120.965 5.44072 120.627 5.47831C120.309 5.51591 120.069 5.6202 119.91 5.7912C119.751 5.94279 119.651 6.17927 119.612 6.50185C119.592 6.82322 119.581 7.27799 119.581 7.86616V18.6097C119.581 19.6708 119.403 20.6568 119.045 21.5663C118.686 22.4564 118.159 23.2338 117.462 23.8971C116.767 24.5411 115.901 25.0529 114.865 25.4312C113.831 25.8108 112.637 26 111.284 26C109.99 26 108.826 25.8387 107.792 25.5161C106.756 25.2129 105.871 24.74 105.135 24.096C104.418 23.4509 103.862 22.6456 103.463 21.6791C103.066 20.6943 102.857 19.5483 102.836 18.2398V7.97894C102.836 7.41139 102.807 6.95662 102.747 6.61585C102.687 6.27386 102.557 6.01797 102.359 5.84819C102.179 5.6772 101.901 5.5632 101.523 5.50621C101.145 5.45042 100.637 5.42132 100 5.42132V4.02911C100.438 4.0667 101.065 4.09459 101.881 4.114C102.697 4.1334 103.553 4.14189 104.449 4.14189C105.344 4.14189 106.2 4.1334 107.015 4.114C107.852 4.09459 108.508 4.0667 108.985 4.02911V5.42132C108.348 5.42132 107.841 5.45042 107.463 5.50621C107.085 5.5632 106.796 5.6772 106.597 5.84819C106.399 6.01797 106.269 6.27386 106.209 6.61585C106.15 6.95662 106.12 7.41139 106.12 7.97894V17.4733C106.12 19.86 106.597 21.5845 107.552 22.6456C108.508 23.6886 110.021 24.2088 112.09 24.2088C112.845 24.2088 113.542 24.0766 114.179 23.811C114.816 23.5455 115.363 23.1768 115.821 22.7026C116.279 22.2102 116.637 21.6136 116.895 20.9126C117.154 20.2105 117.284 19.4246 117.284 18.5527V7.97894C117.284 7.39198 117.264 6.93722 117.224 6.61585C117.204 6.27386 117.104 6.02768 116.926 5.87609C116.767 5.70631 116.507 5.60201 116.149 5.5632C115.812 5.5062 115.324 5.46861 114.687 5.45042V4.02911C115.105 4.0667 115.652 4.09459 116.329 4.114C117.005 4.114 117.702 4.114 118.417 4.114C119.155 4.114 119.841 4.10429 120.478 4.0861C121.134 4.0667 121.642 4.03759 122 4Z" fill="#1a2a3a"/><path d="M132.84 21.8261V7.97111C132.84 7.3713 132.799 6.90753 132.719 6.5798C132.666 6.23104 132.506 5.97999 132.239 5.8254C131.973 5.65225 131.586 5.5459 131.079 5.50633C130.574 5.44944 129.879 5.41976 129 5.41976V4C129.399 4.01855 129.906 4.03833 130.519 4.05812C131.159 4.05812 131.854 4.06678 132.599 4.08657C133.373 4.08657 134.159 4.08657 134.96 4.08657C135.786 4.08657 136.573 4.08657 137.32 4.08657C138.066 4.06678 138.759 4.05812 139.399 4.05812C140.066 4.05812 140.601 4.04824 141 4.02845V5.41976C140.119 5.41976 139.426 5.44944 138.919 5.50633C138.44 5.5459 138.066 5.65225 137.8 5.8254C137.559 5.97999 137.401 6.23104 137.32 6.5798C137.266 6.90753 137.24 7.3713 137.24 7.97111V21.8261C137.24 22.4246 137.279 22.9082 137.36 23.2755C137.44 23.623 137.614 23.8939 137.88 24.0868C138.146 24.2797 138.52 24.4145 139 24.4924C139.507 24.5506 140.174 24.579 141 24.579V25.9703C140.387 25.9518 139.534 25.932 138.44 25.9122C137.346 25.9122 136.199 25.9122 134.999 25.9122C133.827 25.9122 132.693 25.9221 131.599 25.9419C130.507 25.9604 129.64 25.9802 129 26V24.579C129.826 24.579 130.493 24.5506 131 24.4924C131.505 24.4145 131.893 24.2797 132.159 24.0868C132.453 23.8939 132.64 23.623 132.719 23.2755C132.799 22.9082 132.84 22.4246 132.84 21.8261Z" fill="#1a2a3a"/><path d="M168.138 8.02061V26H166.278L152.081 8.91149V21.749C152.081 22.3617 152.11 22.8507 152.169 23.2146C152.229 23.5589 152.356 23.8175 152.554 23.9903C152.75 24.1619 153.035 24.2672 153.409 24.3052C153.783 24.3444 154.285 24.3628 154.915 24.3628V25.7132C154.363 25.6936 153.713 25.6838 152.967 25.6838C152.239 25.6838 151.491 25.6838 150.722 25.6838C149.956 25.6838 149.199 25.6838 148.451 25.6838C147.723 25.7034 147.083 25.7231 146.531 25.7414V24.3628C147.22 24.3628 147.772 24.3444 148.185 24.3052C148.618 24.2489 148.952 24.1337 149.189 23.9609C149.424 23.7697 149.581 23.4916 149.661 23.1288C149.739 22.7649 149.778 22.2661 149.778 21.635V8.02061C149.778 7.4851 149.72 7.05375 149.602 6.72901C149.483 6.38344 149.277 6.1163 148.982 5.92391C148.686 5.71436 148.293 5.56976 147.801 5.49378C147.329 5.41658 146.729 5.3786 146 5.3786V4C146.315 4.03799 146.729 4.0674 147.24 4.08578C147.772 4.08578 148.303 4.08578 148.833 4.08578C149.365 4.08578 149.867 4.0772 150.34 4.05759C150.812 4.03798 151.176 4.01961 151.431 4L165.776 20.9169V7.84905C165.776 7.31231 165.746 6.88219 165.687 6.55623C165.628 6.23027 165.501 5.9815 165.304 5.80994C165.106 5.63716 164.812 5.52197 164.418 5.46438C164.045 5.40801 163.532 5.3786 162.884 5.3786V4C163.336 4.01961 163.926 4.03798 164.654 4.05759C165.402 4.05759 166.169 4.05759 166.956 4.05759C167.764 4.05759 168.53 4.05759 169.258 4.05759C169.986 4.03798 170.567 4.01961 171 4V5.3786C170.311 5.3786 169.78 5.40801 169.406 5.46438C169.033 5.50359 168.747 5.60897 168.551 5.78053C168.353 5.95332 168.236 6.22169 168.195 6.58564C168.156 6.92998 168.138 7.4079 168.138 8.02061Z" fill="#1a2a3a"/><path d="M29.1995 3C29.2283 3.07591 35.3424 19.1709 37.5432 23.835C38.0192 24.8436 39.4397 25.9828 39.4612 26H33.51C33.5369 25.9939 35.1183 25.6324 35.2952 24.9043C35.428 24.3568 35.2954 23.8092 34.7004 23.2617C34.1052 22.7141 32.9143 22.1668 31.7239 21.6191C30.5336 21.0716 31.6362 21.5862 28.7483 20.5234C27.8898 20.2075 26.3674 19.4289 25.177 19.9766C24.7355 20.1797 24.5846 20.516 24.5813 20.5234C24.5813 20.5234 23.6057 23.3516 23.3909 23.8096C23.176 24.2675 22.7964 24.9046 23.9866 25.4521C25.1769 25.9998 25.177 26 25.177 26H19.2249C19.2249 26 19.8 25.4612 20.2795 25.0547C20.7546 24.652 21.0053 23.8252 21.01 23.8096L29.1995 3ZM25.177 18.6514C25.1928 18.644 25.6141 18.4522 26.3665 18.6514C28.4159 19.1943 33.4589 21.0528 33.509 21.0713L28.7473 9.57129L25.177 18.6514Z" fill="#D9D9D9"/></svg>
                                </div>
                                <div style="width: 2px; height: 30px; background: #ddd;"></div>
                                <div style="font-size: 0.7rem; color: #555; line-height: 1.2;">ACADEMIA MUSICAL<br>Gesti&oacute;n Institucional</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 700; font-size: 0.9rem; color: #1a2a3a;">DOC-HR-FUNC-${positionId}</div>
                                <div style="color: #777; font-size: 0.75rem;">Fecha: ${date}</div>
                            </div>
                        </div>

                        <div style="margin-bottom: 40px;">
                            <h1 style="font-size: 1.8rem; margin: 0; color: #1a2a3a; font-weight: 300;">MANUAL DE RESPONSABILIDADES</h1>
                            <div style="width: 60px; height: 4px; background: #ac8421; margin-top: 10px;"></div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px;">
                            <div style="border-left: 3px solid #f0f0f0; padding-left: 20px;">
                                <label style="display: block; font-size: 0.65rem; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Nombre del Cargo</label>
                                <div style="font-weight: 700; font-size: 1.2rem; color: #1a2a3a;">${positionName}</div>
                            </div>
                            <div style="border-left: 3px solid #f0f0f0; padding-left: 20px;">
                                <label style="display: block; font-size: 0.65rem; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Funcionario Asignado</label>
                                <div style="font-weight: 700; font-size: 1.2rem; color: #1a2a3a;">${userName}</div>
                            </div>
                        </div>

                        <div style="margin-bottom: 60px;">
                            <h2 style="font-size: 1rem; color: #1a2a3a; margin-bottom: 25px; font-weight: 800; border-bottom: 1px solid #eee; padding-bottom: 15px;">FUNCIONES ESPEC&Iacute;FICAS</h2>
                            <div style="display: flex; flex-direction: column; gap: 20px;">
                                ${functions.length > 0 ? functions.map((f, i) => `
                                    <div style="display: flex; gap: 20px;">
                                        <div style="flex: 0 0 30px; height: 30px; background: #1a2a3a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">${i + 1}</div>
                                        <div style="flex: 1; font-size: 0.95rem; line-height: 1.6; color: #444;">${f.description}</div>
                                    </div>
                                `).join('') : '<div style="color: #999; font-style: italic;">No hay funciones registradas para este cargo.</div>'}
                            </div>
                        </div>

                        <div style="margin-top: 100px; display: grid; grid-template-columns: 1fr 1fr; gap: 100px;">
                            <div style="text-align: center;">
                                <div style="border-bottom: 1px solid #1a2a3a; margin-bottom: 15px; height: 60px; display: flex; align-items: flex-end; justify-content: center; color: rgba(0,0,0,0.1); font-style: italic; font-size: 0.8rem;">Firma Digital Verificada</div>
                                <div style="font-size: 0.85rem; font-weight: 700; color: #1a2a3a;">${userName}</div>
                                <div style="font-size: 0.7rem; color: #777; text-transform: uppercase;">Firma del Funcionario</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="border-bottom: 1px solid #1a2a3a; margin-bottom: 15px; height: 60px; display: flex; align-items: flex-end; justify-content: center;">
                                    <div style="font-family: 'Lancelot', serif; color: #1a2a3a; opacity: 0.1; font-size: 1.5rem; transform: rotate(-10deg);">JACQUIN</div>
                                </div>
                                <div style="font-size: 0.85rem; font-weight: 700; color: #1a2a3a;">DIRECCI&Oacute;N ADMINISTRATIVA</div>
                                <div style="font-size: 0.7rem; color: #777; text-transform: uppercase;">Sello de Validaci&oacute;n Acad&eacute;mica</div>
                            </div>
                        </div>

                        <div style="position: absolute; bottom: 50px; left: 50px; right: 50px; text-align: center; font-size: 0.65rem; color: #bbb; border-top: 1px solid #f9f9f9; padding-top: 20px; font-weight: 500;">
                            JACQUIN ACADEMIA MUSICAL &copy; 2026 - DOCUMENTO DE USO INTERNO PRIVADO
                        </div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @media print {
                    body * { visibility: hidden !important; }
                    #position-doc-modal, #position-doc-modal * { visibility: visible !important; }
                    #position-doc-modal { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background: white !important; }
                    #printable-doc-area { padding: 0 !important; background: white !important; }
                    .paper-sheet { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
                    button { display: none !important; }
                }
            </style>
        `;

        docModal.style.display = "flex";
        requestAnimationFrame(() => docModal.style.opacity = "1");

    } catch (e) {
        console.error(e);
        if (window.showToast) showToast("Error al cargar funciones: " + e.message, "error");
    }
};

window.printPositionDoc = function () { window.print(); };

window.openProfile = async function (userId, initialTab = 'info') {
    if (!userId) return console.error("openProfile: No userId provided");

    let user = null;
    if (window.allUsers && Array.isArray(window.allUsers)) {
        user = window.allUsers.find(u => (u.id_usuario || u.id) == userId);
    }

    if (!user) {
        try {
            const res = await ApiService.getUserDetails(userId);
            if (res.success && res.data) {
                user = res.data.profile || res.data.user_info || res.data.details;
            }
        } catch (e) {
            console.error("Error fetching user details:", e);
        }
    }

    if (!user) {
        if (window.showToast) showToast("No se pudo cargar la información del usuario", "error");
        return;
    }

    const currentUser = ApiService.getSession();
    let modal = document.getElementById("user-profile-modal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "user-profile-modal";
        document.body.appendChild(modal);
    }

    // Enforce styles and reset opacity
    modal.className = "modal-overlay";
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 8, 20, 0.85) !important;
        z-index: 100000 !important;
        display: none;
        opacity: 0;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        transition: opacity 0.3s ease;
    `;

    // Handle background click (with small timeout to avoid initial bubbling)
    setTimeout(() => {
        modal.onclick = (e) => {
            if (e.target === modal) window.closeProfileModal();
        };
    }, 100);

    modal.innerHTML = `
        <div class="modal-card" style="
            width: 95%; max-width: 850px; padding: 0; overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(25, 47, 72, 0.95);
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            color: var(--color-blanco-neutro);
            font-family: var(--font-principal);
        ">
            <div style="background: linear-gradient(135deg, var(--color-principal-azul), #1a324b); padding: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: var(--color-acento-azul); filter: blur(80px); opacity: 0.2; pointer-events: none;"></div>
                <div style="display: flex; align-items: center; gap: 20px; position: relative; z-index: 1;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid rgba(147, 182, 238, 0.3); background: rgba(0,0,0,0.3);" id="modal-avatar-container">
                        <img src="${user.avatar_url || '../assets/images/default_avatar.svg'}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/images/default_avatar.svg'">
                    </div>
                    <div>
                        <h2 style="margin: 0; color: white; font-size: 1.6rem; font-weight: 600;">${user.full_name}</h2>
                        <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
                            <span style="background: rgba(147, 182, 238, 0.2); color: var(--color-acento-azul); padding: 4px 12px; border-radius: 30px; font-size: 0.7rem; font-weight: 700;">${getRoleName(user.id_rol)}</span>
                            <span style="color: rgba(255,255,255,0.4); font-size: 0.75rem;">ID: ${user.id_usuario || user.id}</span>
                        </div>
                    </div>
                </div>
                <button onclick="window.closeProfileModal()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;"><i class="bi bi-x-lg"></i></button>
            </div>

            <div style="background: rgba(0,0,0,0.2); display: flex; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0 20px;">
                ${(currentUser.id_rol == 1 || (user.id_usuario || user.id) == currentUser.id_usuario) ? `
                    <button onclick="switchUserTab('info')" id="tab-btn-info" class="modal-tab-btn">Información</button>
                    <button onclick="switchUserTab('security')" id="tab-btn-security" class="modal-tab-btn">Seguridad</button>
                ` : ''}
                
                ${((currentUser.id_rol == 1 || (user.id_usuario || user.id) == currentUser.id_usuario) && (user.id_rol == 2 || user.id_rol == 1)) ? `
                    <button onclick="switchUserTab('courses')" id="tab-btn-courses" class="modal-tab-btn">${user.id_rol == 2 ? 'Horario de Clases' : 'Cursos Asignados'}</button>
                ` : ''}
                
                ${(currentUser.id_rol == 1 || (user.id_usuario || user.id) == currentUser.id_usuario) ? `
                    <button onclick="switchUserTab('position')" id="tab-btn-position" class="modal-tab-btn">Cargo e Id</button>
                ` : ''}
                
                ${(currentUser.id_rol == 1 || (currentUser.id_rol == 2 && user.id_rol == 3)) ? `
                    <button onclick="switchUserTab('academic')" id="tab-btn-academic" class="modal-tab-btn">${currentUser.id_rol == 2 ? 'Progreso Estudiante' : 'Gestión Académica'}</button>
                ` : ''}
            </div>

            <div id="modal-tab-content" style="padding: 35px; max-height: 60vh; overflow-y: auto;" class="custom-scroll">
                <div style="text-align: center; color: rgba(255,255,255,0.3); padding: 40px;">Cargando contenido...</div>
            </div>

            <div style="padding: 20px 35px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; align-items: center; gap: 15px;">
                <div style="margin-right: auto; font-size: 0.8rem; color: rgba(255,255,255,0.15);">Módulo de Gestión Académica</div>
                ${currentUser.id_rol == 1 && (user.id_usuario || user.id) != currentUser.id_usuario ? `
                    <button onclick="deleteUserDirectlyModal(${user.id_usuario || user.id}, '${user.full_name.replace(/'/g, "\\'")}')" style="background: rgba(231, 76, 60, 0.1); color: #ff7675; border: 1px solid rgba(231, 76, 60, 0.3); padding: 10px 20px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">Eliminar Usuario</button>
                ` : ''}
                <button onclick="window.closeProfileModal()" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 10px 25px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">Cerrar</button>
            </div>
        </div>
        <style>
            @keyframes fadeInModal { from { opacity: 0; transform: scale(0.95) translateY(20px); filter: blur(10px); } to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } }
            .modal-tab-btn { background: none; border: none; color: rgba(255,255,255,0.4); padding: 18px 30px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s ease; }
            .modal-tab-btn:hover { color: white; background: rgba(255,255,255,0.03); }
            .modal-tab-btn.active { color: var(--color-acento-azul); border-bottom-color: var(--color-acento-azul); background: rgba(147, 182, 238, 0.08); }
            
            .info-field-group { margin-bottom: 20px; }
            .info-field-group label { 
                display: block; 
                color: rgba(255,255,255,0.4); 
                font-size: 0.75rem; 
                text-transform: uppercase; 
                margin-bottom: 8px; 
                font-weight: 600; 
                letter-spacing: 0.5px; 
            }
            .info-field-group input, 
            .info-field-group select { 
                width: 100%;
                background: rgba(0,0,0,0.3) !important; 
                border: 1px solid rgba(255,255,255,0.1) !important; 
                color: white !important;
                border-radius: 10px !important;
                padding: 12px 15px !important;
                font-size: 0.95rem;
                transition: all 0.3s ease;
                outline: none;
            }
            .info-field-group input:focus, 
            .info-field-group select:focus {
                border-color: var(--color-acento-azul) !important;
                box-shadow: 0 0 15px rgba(147, 182, 238, 0.15) !important;
            }
            .custom-scroll::-webkit-scrollbar { width: 6px; }
            .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
            .custom-scroll::-webkit-scrollbar-thumb { background: rgba(147, 182, 238, 0.3); border-radius: 10px; }
        </style>
    `;

    window.currentModalUser = user;
    window.currentModalUserId = (user.id_usuario || user.id);

    // Show modal
    modal.style.display = "flex";
    requestAnimationFrame(() => {
        modal.style.opacity = "1";
    });

    // Auto-determine best tab
    let tabToOpen = initialTab;
    if (currentUser.id_rol == 2 && user.id_rol == 3) {
        tabToOpen = 'academic';
    } else if (currentUser.id_rol != 1 && (user.id_usuario || user.id) != currentUser.id_usuario) {
        tabToOpen = 'academic';
    }

    switchUserTab(tabToOpen);
};

window.switchUserTab = async function (tab) {
    const content = document.getElementById('modal-tab-content');
    const user = window.currentModalUser;
    const currentUser = ApiService.getSession();
    const canEdit = currentUser.id_rol == 1 || (currentUser.id_usuario || currentUser.id) == (user.id_usuario || user.id);

    // Update active tab UI
    document.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-btn-${tab}`);
    if (activeBtn) activeBtn.classList.add('active');

    content.innerHTML = '<div style="text-align:center; padding:50px;"><div class="spinner-border text-primary" role="status"></div></div>';

    try {
        if (tab === 'info') {
            content.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; animation: fadeInModal 0.3s ease-out;">
                    <div>
                        <div class="info-field-group">
                            <label>Nombre Completo</label>
                            <input type="text" id="edit-full-name" value="${user.full_name}" class="form-control" ${!canEdit ? 'readonly' : ''}>
                        </div>
                        <div class="info-field-group">
                            <label>Correo Electrónico</label>
                            <input type="email" id="edit-email" value="${user.email || ''}" class="form-control" ${!canEdit ? 'readonly' : ''}>
                        </div>
                        <div class="info-field-group">
                            <label>Teléfono</label>
                            <input type="text" id="edit-phone" value="${user.n_phone || ''}" class="form-control" ${!canEdit ? 'readonly' : ''}>
                        </div>
                    </div>
                    <div>
                        <div class="info-field-group">
                            <label>Rol</label>
                            <select id="edit-role" class="form-control" ${currentUser.id_rol != 1 ? 'disabled' : ''}>
                                <option value="1" ${user.id_rol == 1 ? 'selected' : ''}>Administrador</option>
                                <option value="2" ${user.id_rol == 2 ? 'selected' : ''}>Docente</option>
                                <option value="3" ${user.id_rol == 3 ? 'selected' : ''}>Estudiante</option>
                                <option value="4" ${user.id_rol == 4 ? 'selected' : ''}>Aspirante</option>
                                <option value="5" ${user.id_rol == 5 ? 'selected' : ''}>Colaborador</option>
                            </select>
                        </div>
                        <div class="info-field-group" style="margin-top:20px;">
                            <label>Configuración</label>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${canEdit ? `
                                    <div onclick="triggerAvatarUploadInModal()" style="padding: 12px 15px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s;" onmouseover="this.style.borderColor='var(--color-acento-azul)'; this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.2)'">
                                        <i class="bi bi-camera" style="color: var(--color-acento-azul); font-size: 1.1rem;"></i>
                                        <span style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Actualizar Avatar</span>
                                    </div>
                                    <button onclick="updateProfileFromModal()" style="width:100%; background: linear-gradient(135deg, var(--color-acento-azul), #5a9fd4); border: none; padding: 12px; border-radius: 10px; color: #081d33; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                        <i class="bi bi-check2-circle"></i> Guardar Cambios
                                    </button>
                                ` : `
                                    <div style="padding: 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; color: rgba(255,255,255,0.3); font-size: 0.8rem; text-align: center;">
                                        Vista de solo lectura para el perfil de usuario.
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'courses') {
            const res = await ApiService.getUserDetails(user.id_usuario || user.id);
            if (res.success) {
                const isTeacher = user.id_rol == 2;
                const courses = isTeacher ? (res.data.teaching || []) : (res.data.enrolled || []);

                if (courses.length === 0) {
                    content.innerHTML = `<div style="text-align:center; padding:40px; color:rgba(255,255,255,0.3);">No hay ${isTeacher ? 'materias asignadas' : 'cursos inscritos'}.</div>`;
                } else {
                    content.innerHTML = `
                        <div style="display: grid; gap: 10px;">
                            ${courses.map(c => {
                        const idToUse = isTeacher ? c.id_course : c.id_enrollment;
                        const actionFn = isTeacher ? 'unassignTeacherFromCourse' : 'unenrollUserFromCourse';
                        const btnTitle = isTeacher ? 'Remover asignación de docente' : 'Desvincular del curso';

                        return `
                                    <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <div>
                                                <div style="color:white; font-weight:600;">${c.name}</div>
                                                ${isTeacher ? `<div style="color:rgba(255,255,255,0.3); font-size:0.75rem; margin-top:2px;">Materia Principal</div>` : ''}
                                            </div>
                                            <div style="display:flex; gap:10px; align-items:center;">
                                                <span style="color:rgba(255,255,255,0.4); font-size:0.8rem;">${c.status || 'Activo'}</span>
                                                ${currentUser.id_rol == 1 ? `
                                                    <button onclick="${actionFn}(${idToUse}, ${user.id_usuario || user.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer; padding:5px;" title="${btnTitle}">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `;
                    }).join('')}
                        </div>
                    `;
                }
            }
        } else if (tab === 'academic') {
            const targetUserId = user.id_usuario || user.id;
            const isTeacher = user.id_rol == 2;

            if (isTeacher) {
                // TEACHER ACADEMIC
                const res = await ApiService.getCourses();
                const allCourses = res.success ? res.data : [];
                const teaching = allCourses.filter(c => c.teacher_id == targetUserId);
                const available = allCourses.filter(c => c.teacher_id != targetUserId && c.name !== 'Instalaciones');

                content.innerHTML = `
                    <div style="animation: fadeInModal 0.3s ease-out;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding: 18px 22px; background: linear-gradient(135deg, rgba(39, 174, 96, 0.15), rgba(39, 174, 96, 0.05)); border-radius: 15px; border-left: 4px solid #27ae60;">
                            <i class="bi bi-person-video3" style="font-size: 1.8rem; color: #27ae60;"></i>
                            <div>
                                <div style="color: white; font-weight: 700; font-size: 1.1rem;">Carga Docente</div>
                                <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">Gestiona las materias asignadas a este profesor</div>
                            </div>
                        </div>

                        <div style="margin-bottom: 30px;">
                            <h4 style="color: white; margin-bottom: 15px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;">
                                <i class="bi bi-journal-check" style="color: #27ae60;"></i> 
                                Materias Actuales
                            </h4>
                            <div style="display: grid; gap: 10px;">
                                ${teaching.map(c => `
                                    <div style="background: rgba(255,255,255,0.03); padding: 15px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="color: white; font-weight: 600;">${c.name}</div>
                                        </div>
                                        <button onclick="unassignTeacherFromCourse(${c.id_course}, ${targetUserId})" style="background: rgba(231, 76, 60, 0.1); color: #ff7675; border: 1px solid rgba(231, 76, 60, 0.3); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; cursor: pointer;">Remover</button>
                                    </div>
                                `).join('') || '<div style="color:rgba(255,255,255,0.2); font-style:italic;">Sin materias asignadas</div>'}
                            </div>
                        </div>
                    </div>
                `;
            } else if (currentUser.id_rol == 2 && user.id_rol == 3) {
                // TEACHER VIEWING STUDENT
                const tasksRes = await ApiService.getAcademicData('get_my_assignments', { student_id: targetUserId });
                const tasks = tasksRes.success ? tasksRes.data : [];

                content.innerHTML = `
                    <div style="animation: fadeInModal 0.3s ease-out;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding: 18px 22px; background: rgba(147, 182, 238, 0.05); border-radius: 15px; border-left: 4px solid var(--color-acento-azul);">
                            <i class="bi bi-journal-text" style="font-size: 1.8rem; color: var(--color-acento-azul);"></i>
                            <div>
                                <div style="color: white; font-weight: 700; font-size: 1.1rem;">Actividades del Estudiante</div>
                                <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">Revisa las entregas y el estado de sus tareas</div>
                            </div>
                        </div>

                        ${tasks.length > 0 ? `
                            <div style="display: grid; gap: 15px;">
                                ${tasks.map(t => {
                    const statusColors = { 'pending': '#ff9f43', 'submitted': '#3498db', 'graded': '#2ecc71' };
                    const statusLabels = { 'pending': 'Pendiente', 'submitted': 'Enviado', 'graded': 'Calificado' };
                    const status = t.submission_status || 'pending';

                    return `
                                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px;">
                                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                                <div>
                                                    <div style="color: white; font-weight: 700; font-size: 1.05rem;">${t.title}</div>
                                                    <div style="color: var(--color-acento-azul); font-size: 0.8rem; font-weight: 600; margin-top: 3px;">${t.course_name}</div>
                                                </div>
                                                <span style="background: ${statusColors[status]}22; color: ${statusColors[status]}; padding: 4px 12px; border-radius: 30px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">${statusLabels[status]}</span>
                                            </div>
                                            
                                            ${status !== 'pending' ? `
                                                <div style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 12px; margin-top: 15px;">
                                                    <div style="color: rgba(255,255,255,0.4); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">Entrega del Alumno</div>
                                                    ${t.submission_url ? `
                                                        <a href="${t.submission_url.startsWith('http') ? t.submission_url : ApiService.BASE_URL + t.submission_url}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #4facfe; text-decoration: none; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600;">
                                                            <i class="bi bi-link-45deg"></i> Ver Trabajo Enviado
                                                        </a>
                                                    ` : ''}
                                                    ${t.submission_text ? `<p style="color: rgba(255,255,255,0.7); font-size: 0.85rem; margin: 0; line-height: 1.4;">"${t.submission_text}"</p>` : ''}
                                                </div>
                                            ` : '<div style="color: rgba(255,255,255,0.2); font-size: 0.8rem; font-style: italic; margin-top: 10px;">El estudiante aún no ha realizado esta entrega.</div>'}

                                            ${status === 'graded' ? `
                                                <div style="display: flex; align-items: center; gap: 10px; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                                                    <div style="background: rgba(46, 204, 113, 0.1); color: #2ecc71; padding: 5px 15px; border-radius: 10px; font-weight: 800; font-size: 1rem;">Nota: ${t.grade}</div>
                                                </div>
                                            ` : status === 'submitted' ? `
                                                <div style="margin-top: 15px; text-align: right;">
                                                    <button onclick="TeacherAcademic.openModal(); window.closeProfileModal()" style="background: var(--color-acento-azul); color: #081d33; border: none; padding: 8px 15px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">Calificar ahora</button>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                }).join('')}
                            </div>
                        ` : '<div style="text-align: center; padding: 50px; color: rgba(255,255,255,0.2);">No hay actividades asignadas.</div>'}
                    </div>
                `;
            }
        } else if (tab === 'position') {
            const res = await ApiService.getUserPositions(user.id_usuario || user.id);
            if (res.success) {
                const assignments = res.data || [];
                content.innerHTML = `
                    <div style="animation: fadeInModal 0.3s ease-out;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding: 18px 22px; background: rgba(231, 140, 59, 0.05); border-radius: 15px; border-left: 4px solid var(--color-acento-naranja);">
                            <i class="bi bi-briefcase" style="font-size: 1.8rem; color: var(--color-acento-naranja);"></i>
                            <div>
                                <div style="color: white; font-weight: 700; font-size: 1.1rem;">Cargos y Perfil Laboral</div>
                                <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">Consulta tus funciones y responsabilidades institucionales</div>
                            </div>
                        </div>

                        <div style="display: grid; gap: 15px;">
                            ${assignments.length > 0 ? assignments.map(a => `
                                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s;" onmouseover="this.style.borderColor='var(--color-acento-azul)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                                    <div style="display: flex; align-items: center; gap: 20px;">
                                        <div style="width: 50px; height: 50px; background: rgba(147, 182, 238, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                                            ${a.icon || '👤'}
                                        </div>
                                        <div>
                                            <div style="color: white; font-weight: 700; font-size: 1.05rem;">${a.position_name}</div>
                                            <div style="color: rgba(255,255,255,0.3); font-size: 0.8rem;">Asignado el ${new Date(a.assigned_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <button onclick="window.openPositionDocument(${a.position_id}, '${a.position_name}', '${user.full_name}')" style="background: rgba(147, 182, 238, 0.1); color: var(--color-acento-azul); border: 1px solid rgba(147, 182, 238, 0.2); padding: 10px 18px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                        <i class="bi bi-file-earmark-text"></i> Ver Funciones
                                    </button>
                                </div>
                            `).join('') : `
                                <div style="text-align: center; padding: 40px; background: rgba(0,0,0,0.1); border-radius: 15px; border: 1px dashed rgba(255,255,255,0.1);">
                                    <i class="bi bi-info-circle" style="font-size: 2rem; color: rgba(255,255,255,0.1); display: block; margin-bottom: 10px;"></i>
                                    <div style="color: rgba(255,255,255,0.2); font-size: 0.9rem;">No hay cargos específicos asignados a este perfil.</div>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            }
        } else if (tab === 'security') {
            content.innerHTML = `
                <div style="animation: fadeInModal 0.3s ease-out; max-width: 500px; margin: 0 auto;">
                    <div style="background: rgba(231, 76, 60, 0.05); border-left: 4px solid #e74c3c; padding: 15px 20px; border-radius: 10px; margin-bottom: 25px;">
                        <div style="color: white; font-weight: 700; font-size: 0.95rem; margin-bottom: 5px;">Seguridad de la Cuenta</div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Te recomendamos cambiar tu contraseña periódicamente para proteger tu información académica.</div>
                    </div>

                    <form onsubmit="handleModalPasswordChange(event)" id="modal-password-form">
                        <div class="info-field-group">
                            <label>Contraseña Actual</label>
                            <input type="password" name="currentPassword" required placeholder="••••••••">
                        </div>
                        <div class="info-field-group">
                            <label>Nueva Contraseña</label>
                            <input type="password" name="newPassword" required placeholder="Mínimo 8 caracteres">
                            <small style="color: rgba(255,255,255,0.2); font-size: 0.7rem; margin-top: 5px; display: block;">Usa mayúsculas, números y símbolos para mayor seguridad.</small>
                        </div>
                        <div class="info-field-group">
                            <label>Confirmar Nueva Contraseña</label>
                            <input type="password" name="confirmPassword" required placeholder="Repite la nueva contraseña">
                        </div>
                        
                        <button type="submit" style="width: 100%; background: linear-gradient(135deg, #e74c3c, #c0392b); border: none; padding: 12px; border-radius: 10px; color: white; font-weight: 700; cursor: pointer; margin-top: 10px; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px;">
                            <i class="bi bi-shield-lock"></i> Actualizar Credenciales
                        </button>
                    </form>
                </div>
            `;
        }
    } catch (e) {
        console.error("switchUserTab Error:", e);
        content.innerHTML = '<div style="color:red; padding:20px;">Error al cargar datos de la pestaña.</div>';
    }
};

function getRoleName(id) {
    const roles = { 1: 'Administrador', 2: 'Docente', 3: 'Estudiante', 4: 'Aspirante', 5: 'Colaborador' };
    return roles[id] || 'Usuario';
}
function triggerAvatarUploadInModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const res = await ApiService.uploadAvatar(file);
        if (res.success) {
            showToast("Avatar actualizado correctamente", "success");
            window.location.reload();
        } else {
            showToast("Error al subir imagen", "error");
        }
    };
    input.click();
}

/**
 * GLOBAL OVERRIDE: Redirects all openMyProfile calls to the Premium Modal
 */
window.openMyProfile = function () {
    const user = ApiService.getSession();
    if (user) {
        window.openProfile(user.id_usuario, 'info');
    } else {
        console.error("No active session found for openMyProfile");
    }
};

window.handleModalPasswordChange = async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const user = ApiService.getSession();

    if (data.newPassword !== data.confirmPassword) {
        return showToast("Las contraseñas no coinciden", "error");
    }

    if (data.newPassword.length < 8) {
        return showToast("La nueva contraseña debe tener al menos 8 caracteres", "warning");
    }

    try {
        const res = await ApiService.changePassword(user.id_usuario, data.currentPassword, data.newPassword);
        if (res.success) {
            showToast("Contraseña actualizada con éxito", "success");
            e.target.reset();
        } else {
            showToast(res.message || "Error al cambiar contraseña", "error");
        }
    } catch (err) {
        showToast("Error de conexión", "error");
    }
};

window.updateProfileFromModal = async function () {
    const user = ApiService.getSession();
    const fullName = document.getElementById('edit-full-name').value;
    const phone = document.getElementById('edit-phone').value;

    if (!fullName) return showToast("El nombre es requerido", "warning");

    try {
        // We can use a direct fetch or ApiService if it exists
        const response = await fetch('/jacquin_api/update_user_profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id_usuario,
                full_name: fullName,
                n_phone: phone
            })
        });
        const result = await response.json();

        if (result.success) {
            showToast("Perfil actualizado correctamente", "success");
            // Update session
            user.full_name = fullName;
            user.n_phone = phone;
            ApiService.saveSession(user);
            // Refresh UI if elements exist
            const nameEl = document.getElementById('dashboard-user-name') || document.getElementById('teacher-user-name');
            if (nameEl) nameEl.textContent = fullName;
        } else {
            showToast(result.message || "Error al actualizar", "error");
        }
    } catch (e) {
        console.error(e);
        showToast("Error de conexión al actualizar perfil", "error");
    }
};
