// جایگزین تابع displayTree با این کد جدید
async function displayTree() {
  if (!contract  !userAccount  !document.getElementById("tree-section")) return;

  document.getElementById("tree-section").style.display = "block";
  const treeDiv = document.getElementById("tree");
  treeDiv.innerHTML = "<div class='tree-container'></div>";
  const treeContainer = treeDiv.querySelector(".tree-container");

  // تابع برای دریافت اطلاعات کاربر
  async function getUserData(address) {
    try {
      if (address === ethers.constants.AddressZero) return null;
      const user = await contract.getUser(address);
      return {
        id: ethers.BigNumber.from(user.id).toString(),
        wallet: user.wallet,
        upline: user.upline,
        left: user.left,
        right: user.right,
        leftCount: ethers.BigNumber.from(user.leftCount).toString(),
        rightCount: ethers.BigNumber.from(user.rightCount).toString()
      };
    } catch (err) {
      console.error(Error fetching user data for ${address}: ${err.message});
      return null;
    }
  }

  // تابع برای ایجاد گره درخت
  function createTreeNode(userData, isCurrentUser = false) {
    const node = document.createElement("div");
    node.className = tree-node ${isCurrentUser ? "current-user" : ""};
    
    const nodeBox = document.createElement("div");
    nodeBox.className = "node-box";
    
    nodeBox.innerHTML = 
      <div class="node-header">
        <span class="node-id">ID: ${userData.id}</span>
        ${isCurrentUser ? "<span class='you-badge'>YOU</span>" : ""}
      </div>
      <div class="node-address">${userData.wallet.substring(0, 6)}...${userData.wallet.substring(38)}</div>
      <div class="node-counts">
        <div class="count left-count">Left: ${userData.leftCount}</div>
        <div class="count right-count">Right: ${userData.rightCount}</div>
      </div>
    ;
    
    node.appendChild(nodeBox);
    return node;
  }

  // تابع برای ساخت درخت
  async function buildTree(startAddress, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return null;
    
    const userData = await getUserData(startAddress);
    if (!userData) return null;
    
    const node = createTreeNode(userData, startAddress.toLowerCase() === userAccount.toLowerCase());
    const branches = document.createElement("div");
    branches.className = "tree-branches";
    
    if (depth < maxDepth) {
      const leftBranch = document.createElement("div");
      leftBranch.className = "tree-branch left-branch";
      const leftChild = await buildTree(userData.left, depth + 1, maxDepth);
      if (leftChild) {
        leftBranch.appendChild(leftChild);
        branches.appendChild(leftBranch);
      }
      
      const rightBranch = document.createElement("div");
      rightBranch.className = "tree-branch right-branch";
      const rightChild = await buildTree(userData.right, depth + 1, maxDepth);
      if (rightChild) {
        rightBranch.appendChild(rightChild);
        branches.appendChild(rightBranch);
      }
    }
    
    node.appendChild(branches);
    return node;
  }

  try {
    const treeRoot = await buildTree(userAccount);
    if (treeRoot) {
      treeContainer.appendChild(treeRoot);
    } else {
      treeDiv.innerHTML = "No tree to display.";
    }
  } catch (err) {
    treeDiv.innerHTML = "Error displaying tree: " + err.message;
  }
}